import {
  initiateUploadSession,
  getMultipartPartUrls,
  finalizeMediaUpload,
  cancelMediaUpload,
  removeMedia,
} from '../services/mediaService.js';
import {
  buildDeliveryUrl,
  cleanupStaleMultipartUploads,
  getStorageConfig,
  getB2Client,
} from '../services/b2StorageService.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

/**
 * Universal JSON response helper
 */
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.end(JSON.stringify(data));
}

/**
 * Parse JSON body from standard IncomingMessage
 */
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Core Media API Request Dispatcher.
 * Works seamlessly with Express, Connect (Vite Dev Server), and Firebase Cloud Functions.
 */
export async function handleMediaApiRequest(req, res, { db = null, auth = null } = {}) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/^\/api\/media/, '').replace(/\/+$/, '') || '/';

  try {
    // 1. Storage Configuration & Health Check
    if (pathname === '/config' && req.method === 'GET') {
      const config = getStorageConfig();
      return sendJson(res, 200, {
        configured: Boolean(config.keyId && config.applicationKey),
        cdnBaseUrl: config.cdnBaseUrl,
        multipartThresholdBytes: config.multipartThresholdBytes,
        maxUploadSizeBytes: config.maxUploadSizeBytes,
        maxVideoSizeBytes: config.maxVideoSizeBytes,
      });
    }

    // Authenticate user from Bearer token if provided
    let user = null;
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token && auth) {
      try {
        user = await auth.verifyIdToken(token);
      } catch (err) {
        console.warn('[MediaApi] Token verification failed:', err.message);
      }
    }

    // 2. Initiate Upload Session (POST /api/media/initiate-upload)
    if (pathname === '/initiate-upload' && req.method === 'POST') {
      const body = await parseBody(req);
      const { fileName, mimeType, size, visibility, folder, metadata } = body;

      const ownerId = user?.uid || body.ownerId || 'user_' + Math.random().toString(36).substring(2, 9);
      const userRole = user?.role || body.userRole || 'member';

      const result = await initiateUploadSession({
        ownerId,
        fileName,
        mimeType,
        size,
        visibility: visibility || 'public',
        folder: folder || 'uploads',
        metadata: metadata || {},
        userRole,
        db,
      });

      return sendJson(res, 200, { success: true, ...result });
    }

    // 3. Get Presigned URLs for Multipart Parts (POST /api/media/get-part-urls)
    if (pathname === '/get-part-urls' && req.method === 'POST') {
      const body = await parseBody(req);
      const { objectKey, uploadId, partNumbers } = body;

      const result = await getMultipartPartUrls({
        objectKey,
        uploadId,
        partNumbers,
      });

      return sendJson(res, 200, { success: true, ...result });
    }

    // 4. Finalize / Complete Upload (POST /api/media/complete-upload)
    if (pathname === '/complete-upload' && req.method === 'POST') {
      const body = await parseBody(req);
      const { mediaId, objectKey, uploadId, parts, expectedSize, isMultipart, visibility } = body;

      const result = await finalizeMediaUpload({
        mediaId,
        objectKey,
        uploadId,
        parts,
        expectedSize,
        isMultipart: Boolean(isMultipart),
        visibility: visibility || 'public',
        db,
      });

      return sendJson(res, 200, result);
    }

    // 5. Abort / Cancel Upload (POST /api/media/abort-upload)
    if (pathname === '/abort-upload' && req.method === 'POST') {
      const body = await parseBody(req);
      const { mediaId, objectKey, uploadId } = body;

      const result = await cancelMediaUpload({
        mediaId,
        objectKey,
        uploadId,
        db,
      });

      return sendJson(res, 200, result);
    }

    // 6. Delete Media (DELETE /api/media/delete or POST /api/media/delete)
    if ((pathname === '/delete' || pathname.startsWith('/delete/')) && (req.method === 'DELETE' || req.method === 'POST')) {
      const body = await parseBody(req);
      const mediaId = body.mediaId || pathname.replace('/delete/', '');
      const objectKey = body.objectKey;

      const result = await removeMedia({
        mediaId,
        objectKey,
        db,
      });

      return sendJson(res, 200, result);
    }

    // 7. Get Secure Delivery URL for Private Media (GET /api/media/delivery-url)
    if (pathname === '/delivery-url' && req.method === 'GET') {
      const objectKey = url.searchParams.get('key');
      const visibility = url.searchParams.get('visibility') || 'private';

      if (!objectKey) {
        return sendJson(res, 400, { error: 'Query parameter "key" is required' });
      }

      const deliveryUrl = await buildDeliveryUrl({
        objectKey,
        visibility,
        expiresIn: 3600,
      });

      return sendJson(res, 200, { url: deliveryUrl, objectKey, visibility });
    }

    // 8. Admin Stale Cleanup (POST /api/media/admin/cleanup)
    if (pathname === '/admin/cleanup' && req.method === 'POST') {
      const body = await parseBody(req);
      const maxAgeHours = parseInt(body.maxAgeHours, 10) || 24;
      const cleanupResult = await cleanupStaleMultipartUploads({ maxAgeHours });
      return sendJson(res, 200, { success: true, ...cleanupResult });
    }

    // 9. Stream Media File directly from B2 (GET /api/media/file/* or /api/media/file?key=...)
    if ((pathname.startsWith('/file') || pathname === '/file') && req.method === 'GET') {
      const objectKey = pathname.replace(/^\/file\/?/, '') || url.searchParams.get('key');
      if (!objectKey) {
        return sendJson(res, 400, { error: 'Media object key is required' });
      }

      const client = getB2Client();
      const config = getStorageConfig();

      try {
        const s3Res = await client.send(new GetObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
        }));

        res.statusCode = 200;
        res.setHeader('Content-Type', s3Res.ContentType || 'application/octet-stream');
        if (s3Res.ContentLength) res.setHeader('Content-Length', s3Res.ContentLength);
        if (s3Res.ETag) res.setHeader('ETag', s3Res.ETag);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (s3Res.Body?.pipe) {
          s3Res.Body.pipe(res);
        } else if (s3Res.Body) {
          const stream = Readable.fromWeb(s3Res.Body);
          stream.pipe(res);
        } else {
          res.end();
        }
        return;
      } catch (err) {
        if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
          return sendJson(res, 404, { error: 'Media file not found' });
        }
        throw err;
      }
    }

    // Not Found
    return sendJson(res, 404, { error: `Media API route not found: ${pathname}` });
  } catch (error) {
    console.error('[MediaApi Error]', error);
    return sendJson(res, 500, {
      error: error.message || 'Internal media server error',
    });
  }
}
