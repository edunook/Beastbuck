/**
 * Automated Verification for Vercel Serverless Function
 * Tests api/media/[...path].js against mock IncomingMessage and ServerResponse.
 */

import handler from '../../api/media/[...path].js';
import { EventEmitter } from 'node:events';
import assert from 'node:assert';
import dotenv from 'dotenv';

dotenv.config();

function createMockReq({ method = 'GET', url = '/api/media/config', body = null, headers = {} } = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = {
    'host': 'beastbuck.vercel.app',
    'origin': 'https://beastbuck.vercel.app',
    ...headers,
  };
  req.body = body;
  req.query = {};
  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    writeHead(status, headers = {}) {
      this.statusCode = status;
      for (const [k, v] of Object.entries(headers)) {
        this.headers[k.toLowerCase()] = v;
      }
    },
    end(chunk) {
      if (chunk) this.body += chunk;
      if (this.onEnd) this.onEnd();
    },
  };
  return res;
}

async function runTests() {
  console.log('Testing Vercel Serverless Function handler...');

  // Test 1: OPTIONS preflight
  {
    console.log('Test 1: OPTIONS /api/media/initiate-upload');
    const req = createMockReq({ method: 'OPTIONS', url: '/api/media/initiate-upload' });
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 204, 'OPTIONS must return 204');
    assert.strictEqual(res.headers['access-control-allow-origin'], 'https://beastbuck.vercel.app');
    console.log('  -> PASS: Status 204, CORS headers verified');
  }

  // Test 2: GET /api/media/config
  {
    console.log('Test 2: GET /api/media/config');
    const req = createMockReq({ method: 'GET', url: '/api/media/config' });
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200, 'Config must return 200');
    const json = JSON.parse(res.body);
    assert.strictEqual(json.configured, true, 'B2 credentials must be recognized');
    assert.ok(json.cdnBaseUrl, 'CDN base URL must be returned');
    console.log(`  -> PASS: Status 200, Configured: ${json.configured}, CDN Base: ${json.cdnBaseUrl}`);
  }

  // Test 3: POST /api/media/initiate-upload (Small Image - Direct Presigned PUT)
  {
    console.log('Test 3: POST /api/media/initiate-upload (Small image)');
    const req = createMockReq({
      method: 'POST',
      url: '/api/media/initiate-upload',
      body: {
        fileName: 'profile-photo.png',
        mimeType: 'image/png',
        size: 1024 * 1024 * 2, // 2MB
        visibility: 'public',
        folder: 'profile-photos',
      },
    });
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200, 'Initiate upload must return 200');
    const json = JSON.parse(res.body);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.isMultipart, false, '2MB file must use single-part direct upload');
    assert.ok(json.uploadUrl, 'Must return presigned PUT URL');
    assert.ok(json.objectKey, 'Must return objectKey');
    assert.ok(json.uploadUrl.includes('s3.us-east-005.backblazeb2.com'), 'Upload URL must target B2 directly');
    console.log('  -> PASS: Direct B2 presigned PUT URL generated successfully');
    console.log(`     Object Key: ${json.objectKey}`);
  }

  // Test 4: POST /api/media/initiate-upload (Large Video - Multipart Upload)
  {
    console.log('Test 4: POST /api/media/initiate-upload (Large 100MB video)');
    const req = createMockReq({
      method: 'POST',
      url: '/api/media/initiate-upload',
      body: {
        fileName: 'epic-movie.mp4',
        mimeType: 'video/mp4',
        size: 100 * 1024 * 1024, // 100MB (> 50MB threshold)
        visibility: 'public',
        folder: 'funflix',
      },
    });
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200, 'Initiate multipart must return 200');
    const json = JSON.parse(res.body);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.isMultipart, true, '100MB file must trigger multipart upload');
    assert.ok(json.uploadId, 'Must return B2 multipart uploadId');
    assert.ok(json.totalParts > 1, 'Must have multiple parts');
    console.log(`  -> PASS: Multipart session created on B2. UploadId: ${json.uploadId.substring(0, 15)}... Parts: ${json.totalParts}`);

    // Test 4b: POST /api/media/abort-upload (Clean up the test multipart session)
    console.log('Test 4b: POST /api/media/abort-upload (Clean up test multipart session)');
    const abortReq = createMockReq({
      method: 'POST',
      url: '/api/media/abort-upload',
      body: {
        mediaId: json.mediaId,
        objectKey: json.objectKey,
        uploadId: json.uploadId,
      },
    });
    const abortRes = createMockRes();
    await handler(abortReq, abortRes);
    assert.strictEqual(abortRes.statusCode, 200, 'Abort must return 200');
    console.log('  -> PASS: Test multipart session successfully aborted and cleaned up');
  }

  // Test 5: GET /api/media/file/* (Vercel Serverless Function Delivery Gateway: 307 Redirect)
  {
    console.log('Test 5: GET /api/media/file/media/dev/test.mp4 (Vercel Delivery Gateway)');
    process.env.VERCEL = '1';
    process.env.MEDIA_CDN_BASE_URL = 'https://beastbuck-media.workers.dev';
    const req = createMockReq({
      method: 'GET',
      url: '/api/media/file/media/dev/test.mp4',
    });
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 307, 'Delivery on Vercel must return 307 Temporary Redirect to Cloudflare CDN');
    assert.ok(res.headers['location'], 'Must have Location header');
    assert.ok(
      res.headers['location'].includes('workers.dev') || res.headers['location'].includes('media.beastbuck.com'),
      'Location must point to Cloudflare CDN'
    );
    console.log(`  -> PASS: 307 Redirect to CDN on Vercel: ${res.headers['location']}`);
  }

  console.log('\nAll Vercel Serverless Function tests passed successfully!\n');
}

runTests().catch(err => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
