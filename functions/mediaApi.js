const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

// Import S3 SDK
const {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListMultipartUploadsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

function getStorageConfig() {
  const multipartThresholdMB = parseInt(process.env.MULTIPART_THRESHOLD_MB, 10) || 50;
  const maxUploadSizeGB = parseInt(process.env.MAX_UPLOAD_SIZE_GB, 10) || 50;
  const maxVideoSizeGB = parseInt(process.env.MAX_VIDEO_SIZE_GB, 10) || 50;
  const minPartSizeMB = parseInt(process.env.MIN_PART_SIZE_MB, 10) || 10;

  return {
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
    region: process.env.B2_REGION || 'us-east-005',
    bucket: process.env.B2_BUCKET || 'beastbuck-media',
    keyId: process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    cdnBaseUrl: (process.env.CDN_MEDIA_BASE_URL || 'https://s3.us-east-005.backblazeb2.com/beastbuck-media').replace(/\/+$/, ''),
    multipartThresholdBytes: multipartThresholdMB * 1024 * 1024,
    maxUploadSizeBytes: maxUploadSizeGB * 1024 * 1024 * 1024,
    maxVideoSizeBytes: maxVideoSizeGB * 1024 * 1024 * 1024,
    minPartSizeBytes: Math.max(5 * 1024 * 1024, minPartSizeMB * 1024 * 1024),
  };
}

let cachedS3Client = null;

function getB2Client() {
  const config = getStorageConfig();
  if (!config.keyId || !config.applicationKey) {
    throw new Error('Backblaze B2 credentials missing. Please configure B2_KEY_ID and B2_APPLICATION_KEY in Cloud Functions environment.');
  }

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
      forcePathStyle: true,
    });
  }
  return cachedS3Client;
}

function sanitizeFileName(fileName) {
  return String(fileName || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 120);
}

function generateObjectKey({ ownerId, mediaType, fileName, folder = 'general' }) {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const cleanOwnerId = String(ownerId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 40);
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const uid = crypto.randomUUID();
  const cleanName = sanitizeFileName(fileName);

  return `media/${env}/${cleanOwnerId}/${folder}/${mediaType}/${yyyy}/${mm}/${uid}-${cleanName}`;
}

function calculatePartSizing(fileSize) {
  const config = getStorageConfig();
  let partSize = config.minPartSizeBytes;
  const maxParts = 10000;

  if (fileSize > 100 * 1024 * 1024 * 1024) partSize = 100 * 1024 * 1024;
  else if (fileSize > 20 * 1024 * 1024 * 1024) partSize = 50 * 1024 * 1024;
  else if (fileSize > 2 * 1024 * 1024 * 1024) partSize = 25 * 1024 * 1024;
  else if (fileSize > 500 * 1024 * 1024) partSize = 15 * 1024 * 1024;

  if (Math.ceil(fileSize / partSize) > maxParts) {
    partSize = Math.ceil(fileSize / maxParts);
  }

  const totalParts = Math.max(1, Math.ceil(fileSize / partSize));
  return { partSize, totalParts };
}

exports.mediaApi = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  const db = admin.firestore();
  const auth = admin.auth();

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/^\/api\/media/, '').replace(/\/+$/, '') || '/';

  try {
    if (pathname === '/config' && req.method === 'GET') {
      const config = getStorageConfig();
      return res.json({
        configured: Boolean(config.keyId && config.applicationKey),
        cdnBaseUrl: config.cdnBaseUrl,
        multipartThresholdBytes: config.multipartThresholdBytes,
        maxUploadSizeBytes: config.maxUploadSizeBytes,
        maxVideoSizeBytes: config.maxVideoSizeBytes,
      });
    }

    let user = null;
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        user = await auth.verifyIdToken(token);
      } catch (err) {
        console.warn('[MediaApi] Token error:', err.message);
      }
    }

    const config = getStorageConfig();
    const client = getB2Client();

    // 1. Initiate Upload
    if (pathname === '/initiate-upload' && req.method === 'POST') {
      const { fileName, mimeType, size, visibility = 'public', folder = 'uploads', metadata = {} } = req.body;
      const ownerId = user?.uid || req.body.ownerId || 'user_' + crypto.randomBytes(4).toString('hex');
      const safeSize = Number(size) || 0;

      let mediaType = 'document';
      if (mimeType?.startsWith('image/')) mediaType = 'image';
      else if (mimeType?.startsWith('video/')) mediaType = 'video';
      else if (mimeType?.startsWith('audio/')) mediaType = 'audio';

      const sanitizedName = sanitizeFileName(fileName);
      const objectKey = generateObjectKey({ ownerId, mediaType, fileName: sanitizedName, folder });
      const isMultipart = safeSize > config.multipartThresholdBytes;
      const mediaId = crypto.randomUUID();

      if (isMultipart) {
        const { partSize, totalParts } = calculatePartSizing(safeSize);
        const command = new CreateMultipartUploadCommand({
          Bucket: config.bucket,
          Key: objectKey,
          ContentType: mimeType,
          Metadata: { ownerid: String(ownerId), mediaid: mediaId, visibility },
        });
        const mpRes = await client.send(command);
        const uploadId = mpRes.UploadId;

        await db.collection('media').doc(mediaId).set({
          id: mediaId,
          ownerId,
          originalName: fileName,
          sanitizedName,
          objectKey,
          mediaType,
          mimeType,
          size: safeSize,
          status: 'uploading',
          isMultipart: true,
          uploadId,
          partSize,
          totalParts,
          visibility,
          folder,
          cdnUrl: visibility === 'public' ? `${config.cdnBaseUrl}/${objectKey}` : null,
          createdAt: new Date().toISOString(),
        });

        return res.json({
          success: true,
          mediaId,
          isMultipart: true,
          uploadId,
          objectKey,
          partSize,
          totalParts,
          visibility,
          mediaType,
          sanitizedName,
          size: safeSize,
          mimeType,
        });
      } else {
        const command = new PutObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
          ContentType: mimeType,
          Metadata: { ownerid: String(ownerId), mediaid: mediaId, visibility },
        });
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

        await db.collection('media').doc(mediaId).set({
          id: mediaId,
          ownerId,
          originalName: fileName,
          sanitizedName,
          objectKey,
          mediaType,
          mimeType,
          size: safeSize,
          status: 'uploading',
          isMultipart: false,
          visibility,
          folder,
          cdnUrl: visibility === 'public' ? `${config.cdnBaseUrl}/${objectKey}` : null,
          createdAt: new Date().toISOString(),
        });

        return res.json({
          success: true,
          mediaId,
          isMultipart: false,
          objectKey,
          uploadUrl,
          visibility,
          mediaType,
          sanitizedName,
          size: safeSize,
          mimeType,
        });
      }
    }

    // 2. Get Part URLs
    if (pathname === '/get-part-urls' && req.method === 'POST') {
      const { objectKey, uploadId, partNumbers = [] } = req.body;
      const parts = await Promise.all(
        partNumbers.map(async (pNum) => {
          const command = new UploadPartCommand({
            Bucket: config.bucket,
            Key: objectKey,
            UploadId: uploadId,
            PartNumber: parseInt(pNum, 10),
          });
          const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
          return { partNumber: parseInt(pNum, 10), uploadUrl };
        })
      );
      return res.json({ success: true, objectKey, uploadId, parts });
    }

    // 3. Complete Upload
    if (pathname === '/complete-upload' && req.method === 'POST') {
      const { mediaId, objectKey, uploadId, parts, expectedSize, isMultipart, visibility = 'public' } = req.body;

      if (isMultipart) {
        const sortedParts = parts
          .map(p => ({
            PartNumber: parseInt(p.PartNumber || p.partNumber, 10),
            ETag: `"${String(p.ETag || p.etag).replace(/^"|"$/g, '')}"`,
          }))
          .sort((a, b) => a.PartNumber - b.PartNumber);

        await client.send(new CompleteMultipartUploadCommand({
          Bucket: config.bucket,
          Key: objectKey,
          UploadId: uploadId,
          MultipartUpload: { Parts: sortedParts },
        }));
      }

      // Verify with HeadObject
      const head = await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: objectKey }));
      const deliveryUrl = visibility === 'public' ? `${config.cdnBaseUrl}/${objectKey}` : await getSignedUrl(client, new GetObjectCommand({ Bucket: config.bucket, Key: objectKey }), { expiresIn: 3600 });

      if (mediaId) {
        await db.collection('media').doc(mediaId).set({
          status: 'ready',
          completedAt: new Date().toISOString(),
          checksum: head.ETag ? head.ETag.replace(/^"|"$/g, '') : null,
          verifiedSize: Number(head.ContentLength),
          cdnUrl: visibility === 'public' ? deliveryUrl : null,
        }, { merge: true });
      }

      return res.json({
        success: true,
        mediaId,
        objectKey,
        status: 'ready',
        url: deliveryUrl,
        cdnUrl: visibility === 'public' ? deliveryUrl : null,
        size: Number(head.ContentLength),
        etag: head.ETag ? head.ETag.replace(/^"|"$/g, '') : null,
        completedAt: new Date().toISOString(),
      });
    }

    // 4. Abort Upload
    if (pathname === '/abort-upload' && req.method === 'POST') {
      const { mediaId, objectKey, uploadId } = req.body;
      if (uploadId) {
        try {
          await client.send(new AbortMultipartUploadCommand({ Bucket: config.bucket, Key: objectKey, UploadId: uploadId }));
        } catch (e) {
          console.warn('Abort error:', e.message);
        }
      }
      if (mediaId) {
        await db.collection('media').doc(mediaId).set({ status: 'aborted', abortedAt: new Date().toISOString() }, { merge: true });
      }
      return res.json({ success: true, status: 'aborted' });
    }

    // 5. Delete Object
    if ((pathname === '/delete' || pathname.startsWith('/delete/')) && (req.method === 'DELETE' || req.method === 'POST')) {
      const { mediaId, objectKey } = req.body;
      if (objectKey) {
        await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }));
      }
      if (mediaId) {
        await db.collection('media').doc(mediaId).set({ status: 'deleted', deletedAt: new Date().toISOString() }, { merge: true });
      }
      return res.json({ success: true, status: 'deleted' });
    }

    // 6. Delivery URL (Private Media)
    if (pathname === '/delivery-url' && req.method === 'GET') {
      const objectKey = url.searchParams.get('key');
      const visibility = url.searchParams.get('visibility') || 'private';
      if (!objectKey) return res.status(400).json({ error: 'Missing key parameter' });

      if (visibility === 'public') {
        return res.json({ url: `${config.cdnBaseUrl}/${objectKey}`, objectKey, visibility });
      }

      const signed = await getSignedUrl(client, new GetObjectCommand({ Bucket: config.bucket, Key: objectKey }), { expiresIn: 3600 });
      return res.json({ url: signed, objectKey, visibility });
    }

    // 7. Stream/Proxy Media File directly from B2
    if ((pathname.startsWith('/file') || pathname === '/file') && req.method === 'GET') {
      const objectKey = pathname.replace(/^\/file\/?/, '') || url.searchParams.get('key');
      if (!objectKey) return res.status(400).json({ error: 'Missing key parameter' });

      try {
        const s3Res = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: objectKey }));
        res.status(200);
        res.setHeader('Content-Type', s3Res.ContentType || 'application/octet-stream');
        if (s3Res.ContentLength) res.setHeader('Content-Length', s3Res.ContentLength);
        if (s3Res.ETag) res.setHeader('ETag', s3Res.ETag);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (s3Res.Body && typeof s3Res.Body.pipe === 'function') {
          s3Res.Body.pipe(res);
        } else {
          res.end();
        }
        return;
      } catch (err) {
        if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
          return res.status(404).json({ error: 'Media file not found' });
        }
        throw err;
      }
    }

    return res.status(404).json({ error: `Not found: ${pathname}` });
  } catch (error) {
    console.error('[MediaApi Cloud Function Error]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Scheduled cleanup for incomplete uploads older than 24 hours
exports.cleanupStaleUploads = onSchedule('every 24 hours', async () => {
  const config = getStorageConfig();
  if (!config.keyId || !config.applicationKey) return;

  const client = getB2Client();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  try {
    const listRes = await client.send(new ListMultipartUploadsCommand({ Bucket: config.bucket }));
    const uploads = listRes.Uploads || [];
    for (const u of uploads) {
      if (new Date(u.Initiated).getTime() < cutoff) {
        await client.send(new AbortMultipartUploadCommand({ Bucket: config.bucket, Key: u.Key, UploadId: u.UploadId }));
        console.log(`[Scheduled Cleanup] Aborted stale upload ${u.UploadId} for key ${u.Key}`);
      }
    }
  } catch (err) {
    console.error('[Scheduled Cleanup Error]', err.message);
  }
});
