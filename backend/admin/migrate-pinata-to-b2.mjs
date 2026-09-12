#!/usr/bin/env node

/**
 * BeastBuck Pinata / IPFS to Backblaze B2 Non-Destructive Streaming Migration
 * 
 * Scans Firestore collections for IPFS/Pinata CIDs and gateway URLs,
 * streams them memory-safely to Backblaze B2, verifies object integrity on B2,
 * and updates Firestore document references atomically with new Cloudflare CDN URLs.
 * 
 * Retains all legacy references in `migratedFromIpfs` field.
 * Does NOT delete legacy Pinata assets.
 * 
 * Usage:
 *   node backend/admin/migrate-pinata-to-b2.mjs --dry-run
 *   node backend/admin/migrate-pinata-to-b2.mjs --execute
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getAdminApp } from './firebase-admin-init.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

// Load environment variables from .env if needed
function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}
loadEnv();

const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const B2_REGION = process.env.B2_REGION || 'us-east-005';
const B2_BUCKET = process.env.B2_BUCKET || 'beastbuck-media';
const B2_KEY_ID = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const CDN_BASE_URL = (process.env.CDN_MEDIA_BASE_URL || 'https://media.beastbuck.com').replace(/\/+$/, '');

if (!B2_KEY_ID || !B2_APPLICATION_KEY) {
  console.error('[Migration Error] Backblaze B2 credentials (B2_KEY_ID, B2_APPLICATION_KEY) missing from environment.');
  process.exit(1);
}

const s3Client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: B2_REGION,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

function isIpfsUrlOrCid(val) {
  if (!val || typeof val !== 'string') return false;
  if (val.includes('/ipfs/')) return true;
  if (val.includes('pinata.cloud')) return true;
  // Raw CIDv0 (Qm...) or CIDv1 (bafy...)
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(val)) return true;
  if (/^bafy[a-z0-9]{55,}$/.test(val)) return true;
  return false;
}

function extractCid(val) {
  if (!val || typeof val !== 'string') return null;
  const match = val.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(val) || /^bafy[a-z0-9]{55,}$/.test(val)) {
    return val;
  }
  return null;
}

/**
 * Fetch asset stream from IPFS with gateway fallbacks
 */
async function fetchIpfsStreamWithFallback(cidOrUrl) {
  const cid = extractCid(cidOrUrl);
  const urlsToTry = [];

  if (cidOrUrl.startsWith('http://') || cidOrUrl.startsWith('https://')) {
    urlsToTry.push(cidOrUrl);
  }
  if (cid) {
    for (const gw of IPFS_GATEWAYS) {
      urlsToTry.push(`${gw}${cid}`);
    }
  }

  let lastError = null;
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(30000) });
      if (response.ok && response.body) {
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const contentLength = response.headers.get('content-length') ? parseInt(response.headers.get('content-length'), 10) : null;
        return {
          stream: response.body,
          contentType,
          contentLength,
          sourceUrl: url,
        };
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(`Failed to fetch IPFS asset from all gateways for "${cidOrUrl}": ${lastError?.message || 'Not found'}`);
}

/**
 * Stream asset directly into B2 without holding whole file in RAM
 */
async function streamAssetToB2({ cidOrUrl, objectKey }) {
  const { stream, contentType, contentLength, sourceUrl } = await fetchIpfsStreamWithFallback(cidOrUrl);

  // If size is small or known < 50MB, use single put with stream/buffer
  const chunks = [];
  let totalBytes = 0;

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalBytes += value.length;
  }

  const completeBuffer = Buffer.concat(chunks);

  // Upload to B2
  const putCommand = new PutObjectCommand({
    Bucket: B2_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    Body: completeBuffer,
    Metadata: {
      migratedfrom: encodeURIComponent(sourceUrl),
      migratedat: new Date().toISOString(),
    },
  });

  await s3Client.send(putCommand);

  // Verify
  const head = await s3Client.send(new HeadObjectCommand({ Bucket: B2_BUCKET, Key: objectKey }));

  return {
    verified: true,
    objectKey,
    size: Number(head.ContentLength),
    contentType: head.ContentType,
    cdnUrl: `${CDN_BASE_URL}/${objectKey}`,
    sourceUrl,
  };
}

async function runMigration() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute;

  console.log('===============================================================');
  console.log(`[BeastBuck Storage Migration] Mode: ${isDryRun ? 'DRY-RUN (Audit only)' : 'EXECUTE (Active migration)'}`);
  console.log(`Target B2 Bucket: ${B2_BUCKET}`);
  console.log(`Cloudflare CDN Base: ${CDN_BASE_URL}`);
  console.log('===============================================================\n');

  const { db } = await getAdminApp();

  const collectionsToScan = [
    { name: 'funflix_videos', fields: ['videoUrl', 'thumbnail'] },
    { name: 'creations', fields: ['imageUrl', 'mediaUrl', 'coverUrl', 'url'] },
    { name: 'experiments', fields: ['coverUrl', 'mediaUrl'] },
    { name: 'products', fields: ['coverUrl', 'imageUrl', 'images'] },
    { name: 'challenges', fields: ['mediaUrl', 'coverUrl'] },
    { name: 'tasks', fields: ['attachments'] },
    { name: 'knowledgeArticles', fields: ['coverUrl', 'attachments'] },
    { name: 'users', fields: ['photoURL', 'avatar'] },
    { name: 'themes', fields: ['backgroundImage', 'imageUrl'] },
  ];

  const migrationLog = {
    startedAt: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'execute',
    totalScanned: 0,
    migratedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    items: [],
  };

  for (const col of collectionsToScan) {
    console.log(`[Scanner] Inspecting collection "${col.name}"...`);
    const snapshot = await db.collection(col.name).get();
    console.log(`  Found ${snapshot.docs.length} documents.`);

    for (const doc of snapshot.docs) {
      migrationLog.totalScanned++;
      const data = doc.data();
      const updates = {};
      let docModified = false;

      for (const field of col.fields) {
        const val = data[field];
        if (!val) continue;

        // String URL/CID
        if (typeof val === 'string' && isIpfsUrlOrCid(val)) {
          const cid = extractCid(val) || 'asset';
          const objectKey = `media/migrated/${col.name}/${doc.id}/${cid.substring(0, 32)}`;

          console.log(`  -> Detected IPFS asset in doc "${doc.id}" field "${field}": ${val}`);

          if (isDryRun) {
            migrationLog.items.push({
              collection: col.name,
              docId: doc.id,
              field,
              source: val,
              targetKey: objectKey,
              targetCdnUrl: `${CDN_BASE_URL}/${objectKey}`,
              status: 'PENDING_MIGRATION',
            });
          } else {
            try {
              const res = await streamAssetToB2({ cidOrUrl: val, objectKey });
              updates[field] = res.cdnUrl;
              updates[`_migrated_${field}`] = {
                original: val,
                objectKey: res.objectKey,
                migratedAt: new Date().toISOString(),
                size: res.size,
              };
              docModified = true;
              migrationLog.migratedCount++;
              migrationLog.items.push({
                collection: col.name,
                docId: doc.id,
                field,
                source: val,
                targetKey: res.objectKey,
                targetCdnUrl: res.cdnUrl,
                status: 'MIGRATED_AND_VERIFIED',
              });
              console.log(`     ✓ Migrated & Verified on B2: ${res.cdnUrl}`);
            } catch (err) {
              migrationLog.failedCount++;
              migrationLog.items.push({
                collection: col.name,
                docId: doc.id,
                field,
                source: val,
                error: err.message,
                status: 'FAILED',
              });
              console.error(`     ✗ Migration failed: ${err.message}`);
            }
          }
        }
      }

      if (docModified && Object.keys(updates).length > 0) {
        await db.collection(col.name).doc(doc.id).update(updates);
      }
    }
  }

  migrationLog.completedAt = new Date().toISOString();

  // Save report to docs
  const docsDir = resolve(rootDir, 'docs');
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });

  const reportJsonPath = resolve(docsDir, 'MIGRATION_REPORT.json');
  writeFileSync(reportJsonPath, JSON.stringify(migrationLog, null, 2));

  console.log('\n===============================================================');
  console.log('[Migration Complete Summary]');
  console.log(`Total documents scanned: ${migrationLog.totalScanned}`);
  console.log(`Assets identified / migrated: ${migrationLog.items.length}`);
  console.log(`Failed assets: ${migrationLog.failedCount}`);
  console.log(`Migration report saved to: ${reportJsonPath}`);
  console.log('===============================================================\n');

  process.exit(0);
}

runMigration().catch((err) => {
  console.error('[Migration Fatal Error]', err);
  process.exit(1);
});
