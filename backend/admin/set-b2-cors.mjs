/**
 * set-b2-cors.mjs
 * Run once to configure CORS on your Backblaze B2 bucket.
 *
 * Usage:  node backend/admin/set-b2-cors.mjs
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const {
  B2_ENDPOINT,
  B2_REGION,
  B2_BUCKET,
  B2_KEY_ID,
  B2_APPLICATION_KEY,
} = process.env;

if (!B2_KEY_ID || !B2_APPLICATION_KEY) {
  console.error('❌  B2_KEY_ID and B2_APPLICATION_KEY must be set in .env');
  process.exit(1);
}

const client = new S3Client({
  endpoint: B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  region:   B2_REGION   || 'us-east-005',
  credentials: {
    accessKeyId:     B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const bucket = B2_BUCKET || 'beastbuck-media';

// CORS rules — allow browser uploads from localhost and production
const corsRules = [
  {
    ID: 'beastbuck-browser-uploads',
    AllowedOrigins: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://beastbuck.com',
      'https://www.beastbuck.com',
      'https://*.vercel.app',
    ],
    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
    AllowedHeaders: [
      'Content-Type',
      'Content-Length',
      'Authorization',
      'X-Requested-With',
      'x-amz-*',
      'X-Amz-*',
    ],
    ExposeHeaders: [
      'ETag',
      'Content-Length',
      'x-amz-request-id',
    ],
    MaxAgeSeconds: 3600,
  },
];

async function applyCors() {
  console.log(`\n🔧  Applying CORS rules to bucket: ${bucket}\n`);

  try {
    await client.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: { CORSRules: corsRules },
    }));
    console.log('✅  CORS rules applied successfully!\n');

    // Read back to confirm
    const result = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('📋  Current CORS config:\n', JSON.stringify(result.CORSRules, null, 2));
  } catch (err) {
    console.error('❌  Failed to apply CORS:', err.message);
    console.error(err);
    process.exit(1);
  }
}

applyCors();
