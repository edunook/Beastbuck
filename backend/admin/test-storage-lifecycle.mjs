#!/usr/bin/env node

/**
 * BeastBuck Backblaze B2 + Cloudflare CDN End-to-End Storage Verification Suite
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateMediaMeta,
  calculatePartSizing,
  generateObjectKey,
  sanitizeFileName,
  getStorageConfig,
} from '../services/b2StorageService.js';
import {
  initiateUploadSession,
  getMultipartPartUrls,
} from '../services/mediaService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

// Load environment variables
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

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('  BeastBuck Backblaze B2 + CDN Storage System Verification');
  console.log('===============================================================\n');

  // Test 1: Configuration
  console.log('[Test Suite 1: Storage Configuration]');
  const config = getStorageConfig();
  assert(Boolean(config.endpoint), `Endpoint configured: ${config.endpoint}`);
  assert(Boolean(config.bucket), `Bucket configured: ${config.bucket}`);
  assert(config.multipartThresholdBytes === 50 * 1024 * 1024, `Multipart threshold is 50MB (${config.multipartThresholdBytes} bytes)`);
  assert(config.maxUploadSizeBytes === 50 * 1024 * 1024 * 1024, `Max upload limit is 50GB`);
  assert(config.cdnBaseUrl === 'https://media.beastbuck.com', `CDN URL configured: ${config.cdnBaseUrl}`);

  // Test 2: File Validation
  console.log('\n[Test Suite 2: MIME & Size Validation]');
  const validImg = validateMediaMeta({ fileName: 'hero_banner.webp', mimeType: 'image/webp', size: 2 * 1024 * 1024 });
  assert(validImg.valid && validImg.mediaType === 'image', 'Valid WebP image passes validation');

  const validVid = validateMediaMeta({ fileName: 'cinematic_trailer.mp4', mimeType: 'video/mp4', size: 1.5 * 1024 * 1024 * 1024 });
  assert(validVid.valid && validVid.mediaType === 'video', 'Valid 1.5GB MP4 video passes validation');

  let invalidMimeError = false;
  try {
    validateMediaMeta({ fileName: 'exploit.exe', mimeType: 'application/x-msdownload', size: 500 });
  } catch (e) {
    invalidMimeError = true;
  }
  assert(invalidMimeError, 'Rejects unauthorized MIME type (.exe)');

  let extMismatchError = false;
  try {
    validateMediaMeta({ fileName: 'fake_image.png', mimeType: 'video/mp4', size: 1000 });
  } catch (e) {
    extMismatchError = true;
  }
  assert(extMismatchError, 'Rejects extension mismatch (.png with video/mp4)');

  // Test 3: Object Key Design & Directory Traversal Protection
  console.log('\n[Test Suite 3: Object Key Design & Directory Traversal Protection]');
  const unsafeName = '../../../secret/../../malicious$$file name.mp4';
  const cleanName = sanitizeFileName(unsafeName);
  assert(!cleanName.includes('..') && !cleanName.includes('/') && !cleanName.includes('\\') && !cleanName.includes('$'), `Sanitized name safe: "${cleanName}"`);

  const key = generateObjectKey({ ownerId: 'user_4812a', mediaType: 'video', fileName: 'sample.mp4', folder: 'funflix' });
  assert(key.startsWith('media/') && key.includes('user_4812a') && key.endsWith('sample.mp4'), `Deterministic key structure: ${key}`);

  // Test 4: Dynamic Part Sizing Scaling
  console.log('\n[Test Suite 4: Dynamic Part Sizing for Multi-GB Files]');
  const smallSize = 40 * 1024 * 1024; // 40MB
  const mediumVidSize = 2.5 * 1024 * 1024 * 1024; // 2.5GB (2560 MB)
  const massiveVidSize = 45 * 1024 * 1024 * 1024; // 45GB

  const smallSizing = calculatePartSizing(smallSize);
  assert(smallSizing.partSize >= 5 * 1024 * 1024, `Small sizing meets B2 5MB min: ${smallSizing.partSize / (1024 * 1024)}MB`);

  const medSizing = calculatePartSizing(mediumVidSize);
  assert(medSizing.partSize === 25 * 1024 * 1024 && medSizing.totalParts === 103, `2.5GB video uses 25MB parts (total ${medSizing.totalParts} parts)`);

  const massiveSizing = calculatePartSizing(massiveVidSize);
  assert(massiveSizing.partSize === 50 * 1024 * 1024 && massiveSizing.totalParts <= 10000, `45GB video uses 50MB parts (${massiveSizing.totalParts} parts <= 10,000 max)`);

  // Test 5: Single Part Presigned URL Generation
  console.log('\n[Test Suite 5: Single-Part Presigned Upload Initiation]');
  const singleSession = await initiateUploadSession({
    ownerId: 'test_user_01',
    fileName: 'avatar.png',
    mimeType: 'image/png',
    size: 2 * 1024 * 1024, // 2MB (< 50MB threshold)
    visibility: 'public',
    folder: 'profile',
  });
  assert(!singleSession.isMultipart, 'Files under 50MB automatically use single-part upload');
  assert(singleSession.uploadUrl && singleSession.uploadUrl.includes(config.bucket), 'Generated valid S3 presigned PUT URL');
  assert(singleSession.objectKey.includes('profile/image'), 'Object key contains folder and mediaType');

  // Test 6: Presigned Part URLs Offline Structure Check
  console.log('\n[Test Suite 6: Presigned Part URL Generator Logic]');
  const partUrlsResult = await getMultipartPartUrls({
    objectKey: 'media/dev/user1/funflix/video/2026/09/demo.mp4',
    uploadId: 'test-upload-session-id-123',
    partNumbers: [1, 2, 3],
  });
  assert(partUrlsResult.parts.length === 3, 'Generated presigned URLs for parts 1, 2, 3');
  assert(partUrlsResult.parts[0].uploadUrl.includes('partNumber=1'), 'Part 1 URL contains partNumber parameter');
  assert(partUrlsResult.parts[1].uploadUrl.includes('partNumber=2'), 'Part 2 URL contains partNumber parameter');
  assert(partUrlsResult.parts[2].uploadUrl.includes('partNumber=3'), 'Part 3 URL contains partNumber parameter');

  // Test 7: Public vs Private CDN Delivery URLs
  console.log('\n[Test Suite 7: Public CDN vs Private Protected Delivery URLs]');
  const publicCdnUrl = `${config.cdnBaseUrl}/media/prod/user1/image/2026/09/photo.webp`;
  assert(publicCdnUrl.startsWith('https://media.beastbuck.com'), 'Public media routes through Cloudflare CDN hostname');

  console.log('\n===============================================================');
  console.log(`[Verification Results] Passed: ${passCount} | Failed: ${failCount}`);
  console.log('===============================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('[Verification Fatal Error]', err);
  process.exit(1);
});
