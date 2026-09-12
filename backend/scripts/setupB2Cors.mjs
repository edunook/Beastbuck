/**
 * BeastBuck Backblaze B2 Restrictive CORS Configuration Tool
 * 
 * Configures production-grade, restrictive CORS rules on the private B2 media bucket via the S3 API.
 * 
 * Rules:
 *  - Allowed Origins: BeastBuck production origin (https://beastbuck.vercel.app) and local development
 *  - Allowed Methods: PUT, GET, HEAD (only what's needed for direct browser uploads and verification)
 *  - Allowed Headers: Content-Type, Authorization, x-amz-checksum-crc32, x-amz-sdk-checksum-algorithm, x-amz-meta-*
 *  - Exposed Headers: ETag (critical for multipart uploads), Content-Length, x-amz-checksum-crc32
 * 
 * SAFETY:
 *  - By default, runs in INSPECTION / DRY-RUN mode to show current CORS status without modifying production.
 *  - Pass `--apply` to commit the CORS rule.
 */

import {
  S3Client,
  GetBucketCorsCommand,
  PutBucketCorsCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import process from 'node:process';

// Load environment variables from .env
dotenv.config();

const keyId = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID;
const applicationKey = process.env.B2_APPLICATION_KEY;
const endpoint = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const region = process.env.B2_REGION || 'us-east-005';
const bucket = process.env.B2_BUCKET || 'beastbuck-media';

// Production and development origins
const RESTRICTIVE_CORS_RULES = [
  {
    AllowedOrigins: [
      'https://beastbuck.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    AllowedMethods: [
      'PUT',
      'GET',
      'HEAD',
    ],
    AllowedHeaders: [
      'Authorization',
      'Content-Type',
      'Content-Length',
      'x-amz-checksum-crc32',
      'x-amz-sdk-checksum-algorithm',
      'x-amz-date',
      'x-amz-content-sha256',
      'x-amz-user-agent',
      'x-amz-meta-*',
    ],
    ExposeHeaders: [
      'ETag',
      'Content-Length',
      'x-amz-checksum-crc32',
      'x-amz-request-id',
      'x-amz-id-2',
    ],
    MaxAgeSeconds: 3600,
  },
];

async function main() {
  console.log('===========================================================');
  console.log('  BeastBuck Backblaze B2 S3 CORS Configuration Inspector  ');
  console.log('===========================================================\n');

  // Verify credentials without exposing secret values
  const missing = [];
  if (!keyId) missing.push('B2_KEY_ID');
  if (!applicationKey) missing.push('B2_APPLICATION_KEY');
  if (!bucket) missing.push('B2_BUCKET');

  if (missing.length > 0) {
    console.error(`[ERROR] Missing required B2 environment variables: ${missing.join(', ')}`);
    console.error('Please ensure B2_KEY_ID and B2_APPLICATION_KEY are set in .env or your shell environment.\n');
    process.exit(1);
  }

  const maskedKeyId = keyId.length > 6 ? `${keyId.substring(0, 4)}...${keyId.slice(-3)}` : '***';
  console.log(`Target Bucket: ${bucket}`);
  console.log(`B2 Endpoint  : ${endpoint}`);
  console.log(`B2 Region    : ${region}`);
  console.log(`Key ID       : ${maskedKeyId} (Application Key masked for security)\n`);

  const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: applicationKey,
    },
    forcePathStyle: true,
  });

  // 1. Inspect existing CORS rules
  console.log('--- Checking Current Bucket CORS Configuration ---');
  let currentRules = null;
  try {
    const corsData = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }));
    currentRules = corsData.CORSRules || [];
    console.log(`Current CORS Rules Count: ${currentRules.length}`);
    console.log(JSON.stringify(currentRules, null, 2));
  } catch (err) {
    if (err.name === 'NoSuchCORSConfiguration' || err.$metadata?.httpStatusCode === 404) {
      console.log('Current Status: No CORS configuration currently exists on this bucket.');
    } else {
      console.warn(`Warning: Could not fetch existing CORS rules (${err.message})`);
    }
  }

  console.log('\n--- Target Production CORS Configuration ---');
  console.log(JSON.stringify(RESTRICTIVE_CORS_RULES, null, 2));

  // 2. Check for --apply flag
  const isApply = process.argv.includes('--apply');
  if (!isApply) {
    console.log('\n===========================================================');
    console.log('  DRY-RUN / INSPECTION MODE COMPLETE');
    console.log('  No changes were made to the Backblaze B2 bucket.');
    console.log('  ');
    console.log('  To apply this restrictive CORS configuration, execute:');
    console.log('    npm run setup:b2-cors -- --apply');
    console.log('===========================================================\n');
    return;
  }

  // 3. Apply CORS configuration
  console.log('\n--- Applying Restrictive CORS Configuration to B2 Bucket ---');
  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: RESTRICTIVE_CORS_RULES,
      },
    }));
    console.log('[SUCCESS] Restrictive CORS configuration applied successfully to bucket:', bucket);

    // Verify
    const verifyData = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('\n--- Verified Active CORS Configuration ---');
    console.log(JSON.stringify(verifyData.CORSRules, null, 2));
    console.log('\n[DONE] Production B2 CORS setup verified.\n');
  } catch (err) {
    console.error('[ERROR] Failed to apply CORS configuration:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
