#!/usr/bin/env node

/**
 * BeastBuck Complete Pinata/IPFS → Backblaze B2 Migration
 * 
 * Migrates ALL Pinata/IPFS media references across:
 *   - funflix_videos (videoUrl, thumbnail)
 *   - users (photoURL, avatar)
 *   - publicProfiles (photoURL)
 *   - presence (avatar)
 * 
 * For each asset:
 *   1. Tries to fetch from Pinata and 3 fallback IPFS gateways
 *   2. If content is valid media (not "Hello World" text), uploads to B2
 *   3. Updates all affected Firestore documents with the new Cloudflare CDN URL
 *   4. Clears photoCID field (it's a legacy Pinata-era field)
 *
 * Usage:
 *   node backend/admin/migrate-all-pinata-to-b2.mjs --dry-run    (audit only)
 *   node backend/admin/migrate-all-pinata-to-b2.mjs --execute    (live migration)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getAdminApp } from './firebase-admin-init.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

// Load .env
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
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const CDN_BASE = (
  process.env.MEDIA_CDN_BASE_URL ||
  process.env.CDN_MEDIA_BASE_URL ||
  'https://beastbuck-media.learningaurstudywala.workers.dev'
).replace(/\/+$/, '');

if (!B2_KEY_ID || !B2_APPLICATION_KEY) {
  console.error('[Error] B2_KEY_ID and B2_APPLICATION_KEY must be set in .env');
  process.exit(1);
}

console.log(`B2 Bucket: ${B2_BUCKET}`);
console.log(`CDN Base: ${CDN_BASE}\n`);

const s3 = new S3Client({
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

function extractCid(url) {
  if (!url) return null;
  const m = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

/**
 * Attempt to fetch an asset from Pinata/IPFS gateways.
 * Returns { buffer, contentType, sourceUrl } or throws.
 * Rejects "Hello World" / text/html non-media responses.
 */
async function fetchIpfsAsset(urlOrCid) {
  const cid = extractCid(urlOrCid);
  const toTry = [];

  // If it's already a full URL, try it first
  if (urlOrCid.startsWith('http')) toTry.push(urlOrCid);
  // Then try each gateway with the extracted CID
  if (cid) {
    for (const gw of IPFS_GATEWAYS) {
      const candidate = `${gw}${cid}`;
      if (!toTry.includes(candidate)) toTry.push(candidate);
    }
  }

  let lastError = null;
  for (const url of toTry) {
    try {
      console.log(`    Trying: ${url}`);
      const resp = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'BeastBuck-Migration/1.0' },
      });

      if (!resp.ok) {
        console.log(`    → HTTP ${resp.status} - skipping`);
        lastError = new Error(`HTTP ${resp.status} from ${url}`);
        continue;
      }

      const contentType = resp.headers.get('content-type') || 'application/octet-stream';

      // Reject non-media content (text/html "Hello World" etc.)
      const isMedia = (
        contentType.startsWith('image/') ||
        contentType.startsWith('video/') ||
        contentType.startsWith('audio/') ||
        contentType === 'application/octet-stream'
      );
      if (!isMedia) {
        const text = await resp.text();
        const snippet = text.trim().substring(0, 80);
        console.log(`    → Non-media content-type "${contentType}", body preview: "${snippet}"`);
        lastError = new Error(`Non-media response from ${url}: content-type=${contentType}`);
        continue;
      }

      const buffer = Buffer.from(await resp.arrayBuffer());
      if (buffer.length === 0) {
        lastError = new Error(`Empty response body from ${url}`);
        continue;
      }

      // Double-check: reject tiny text-like buffers
      const preview = buffer.slice(0, 64).toString('utf8');
      if (preview.toLowerCase().includes('hello world') || preview.toLowerCase().startsWith('<!doctype') || preview.toLowerCase().startsWith('<html')) {
        console.log(`    → Looks like text/HTML, not real media. Preview: "${preview.substring(0, 60)}"`);
        lastError = new Error(`Response appears to be text/HTML, not media: ${url}`);
        continue;
      }

      console.log(`    ✓ Got ${buffer.length} bytes, content-type: ${contentType}`);
      return { buffer, contentType, sourceUrl: url };

    } catch (err) {
      console.log(`    → Error: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Could not fetch valid media from any IPFS gateway for "${urlOrCid}". Last error: ${lastError?.message}`);
}

async function uploadToB2({ buffer, contentType, objectKey, sourceUrl }) {
  await s3.send(new PutObjectCommand({
    Bucket: B2_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    Body: buffer,
    Metadata: {
      migratedfrom: encodeURIComponent(sourceUrl),
      migratedat: new Date().toISOString(),
    },
  }));

  // Verify on B2
  const head = await s3.send(new HeadObjectCommand({ Bucket: B2_BUCKET, Key: objectKey }));
  return {
    objectKey,
    size: Number(head.ContentLength),
    contentType: head.ContentType,
    cdnUrl: `${CDN_BASE}/${objectKey}`,
  };
}

// All collections and their IPFS-containing fields
const COLLECTIONS_TO_MIGRATE = [
  {
    name: 'funflix_videos',
    fields: ['videoUrl', 'thumbnail'],
    extraUpdates: (doc, field, cdnUrl) => ({}),
  },
  {
    name: 'users',
    fields: ['photoURL', 'avatar'],
    extraUpdates: (doc, field, cdnUrl) => {
      // Clear photoCID since it's a Pinata-era legacy field
      return { photoCID: null };
    },
  },
  {
    name: 'publicProfiles',
    fields: ['photoURL'],
    extraUpdates: (doc, field, cdnUrl) => {
      return { photoCID: null };
    },
  },
  {
    name: 'presence',
    fields: ['avatar'],
    extraUpdates: (doc, field, cdnUrl) => ({}),
  },
];

async function run() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute;

  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (audit only)' : '⚡ EXECUTE (live migration)'}`);
  console.log('='.repeat(60) + '\n');

  const { db } = await getAdminApp();

  const log = {
    mode: isDryRun ? 'dry-run' : 'execute',
    startedAt: new Date().toISOString(),
    items: [],
    migrated: 0,
    skipped: 0,
    failed: 0,
    unreachable: 0,
  };

  for (const col of COLLECTIONS_TO_MIGRATE) {
    console.log(`\n[Collection: ${col.name}]`);
    const snapshot = await db.collection(col.name).get();
    console.log(`  ${snapshot.docs.length} documents`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const updates = {};
      let modified = false;

      for (const field of col.fields) {
        const val = data[field];
        if (!val || typeof val !== 'string') continue;

        const isIpfs = val.includes('/ipfs/') || val.includes('pinata.cloud');
        if (!isIpfs) continue;

        const cid = extractCid(val) || 'unknown';
        const objectKey = `media/migrated/${col.name}/${doc.id}/${cid.substring(0, 46)}`;

        console.log(`\n  Doc: ${doc.id} | Field: ${field}`);
        console.log(`  Source: ${val}`);
        console.log(`  Target: ${CDN_BASE}/${objectKey}`);

        if (isDryRun) {
          log.items.push({
            collection: col.name,
            docId: doc.id,
            field,
            source: val,
            targetKey: objectKey,
            targetCdnUrl: `${CDN_BASE}/${objectKey}`,
            status: 'PENDING',
          });
          log.skipped++;
          continue;
        }

        // Check if already in B2
        try {
          await s3.send(new HeadObjectCommand({ Bucket: B2_BUCKET, Key: objectKey }));
          console.log(`  → Already exists on B2, updating Firestore reference.`);
          updates[field] = `${CDN_BASE}/${objectKey}`;
          updates[`_migrated_${field}`] = {
            original: val,
            objectKey,
            migratedAt: new Date().toISOString(),
            note: 'already-existed-on-b2',
          };
          Object.assign(updates, col.extraUpdates(doc, field, `${CDN_BASE}/${objectKey}`));
          modified = true;
          log.migrated++;
          log.items.push({ collection: col.name, docId: doc.id, field, status: 'ALREADY_ON_B2', cdnUrl: `${CDN_BASE}/${objectKey}` });
          continue;
        } catch (headErr) {
          // Not found on B2 - need to migrate
        }

        // Fetch from IPFS
        try {
          const asset = await fetchIpfsAsset(val);
          const result = await uploadToB2({ ...asset, objectKey, sourceUrl: asset.sourceUrl });

          updates[field] = result.cdnUrl;
          updates[`_migrated_${field}`] = {
            original: val,
            objectKey: result.objectKey,
            migratedAt: new Date().toISOString(),
            size: result.size,
            contentType: result.contentType,
          };
          Object.assign(updates, col.extraUpdates(doc, field, result.cdnUrl));
          modified = true;
          log.migrated++;
          log.items.push({
            collection: col.name,
            docId: doc.id,
            field,
            status: 'MIGRATED',
            cdnUrl: result.cdnUrl,
            size: result.size,
          });
          console.log(`  ✓ Migrated → ${result.cdnUrl} (${result.size} bytes)`);

        } catch (err) {
          console.error(`  ✗ FAILED: ${err.message}`);
          log.failed++;
          log.items.push({
            collection: col.name,
            docId: doc.id,
            field,
            status: 'FAILED',
            source: val,
            error: err.message,
          });
        }
      }

      // Apply updates to Firestore
      if (!isDryRun && modified && Object.keys(updates).length > 0) {
        await db.collection(col.name).doc(doc.id).update(updates);
        console.log(`  Firestore updated for doc ${doc.id}`);
      }
    }
  }

  log.completedAt = new Date().toISOString();

  // Save report
  const docsDir = resolve(rootDir, 'docs');
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
  const reportPath = resolve(docsDir, 'FULL_MIGRATION_REPORT.json');
  writeFileSync(reportPath, JSON.stringify(log, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('[Migration Complete]');
  console.log(`  Migrated:   ${log.migrated}`);
  console.log(`  Failed:     ${log.failed}`);
  console.log(`  Skipped:    ${log.skipped} (dry-run audit)`);
  console.log(`  Report:     ${reportPath}`);
  console.log('='.repeat(60));

  if (log.failed > 0 && !isDryRun) {
    console.log('\n⚠️  Some assets could not be fetched from IPFS gateways.');
    console.log('   These documents will continue to show their old Pinata URL.');
    console.log('   Consider uploading new profile photos for affected users.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
