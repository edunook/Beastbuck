import {
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
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';

// Configuration defaults
const DEFAULT_B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const DEFAULT_B2_REGION = process.env.B2_REGION || 'us-east-005';
const DEFAULT_B2_BUCKET = process.env.B2_BUCKET || 'beastbuck-media';
const DEFAULT_CDN_BASE_URL = process.env.MEDIA_CDN_BASE_URL || process.env.VITE_MEDIA_CDN_BASE_URL || process.env.CDN_MEDIA_BASE_URL || process.env.VITE_CDN_MEDIA_BASE_URL || 'https://beastbuck-media.workers.dev';

// Configurable thresholds & limits
export function getStorageConfig() {
  const multipartThresholdMB = parseInt(process.env.MULTIPART_THRESHOLD_MB, 10) || 50; // Default 50MB
  const maxUploadSizeGB = parseInt(process.env.MAX_UPLOAD_SIZE_GB, 10) || 50; // Default 50GB
  const maxVideoSizeGB = parseInt(process.env.MAX_VIDEO_SIZE_GB, 10) || 50; // Default 50GB
  const minPartSizeMB = parseInt(process.env.MIN_PART_SIZE_MB, 10) || 10; // Default 10MB (B2 min is 5MB)

  const cdnUrl = process.env.MEDIA_CDN_BASE_URL ||
    process.env.VITE_MEDIA_CDN_BASE_URL ||
    process.env.CDN_MEDIA_BASE_URL ||
    process.env.VITE_CDN_MEDIA_BASE_URL ||
    DEFAULT_CDN_BASE_URL;

  return {
    endpoint: process.env.B2_ENDPOINT || DEFAULT_B2_ENDPOINT,
    region: process.env.B2_REGION || DEFAULT_B2_REGION,
    bucket: process.env.B2_BUCKET || DEFAULT_B2_BUCKET,
    keyId: process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    cdnBaseUrl: cdnUrl.replace(/\/+$/, ''),
    multipartThresholdBytes: multipartThresholdMB * 1024 * 1024,
    maxUploadSizeBytes: maxUploadSizeGB * 1024 * 1024 * 1024,
    maxVideoSizeBytes: maxVideoSizeGB * 1024 * 1024 * 1024,
    minPartSizeBytes: Math.max(5 * 1024 * 1024, minPartSizeMB * 1024 * 1024),
  };
}

let cachedS3Client = null;

export function getB2Client() {
  const config = getStorageConfig();
  if (!config.keyId || !config.applicationKey) {
    throw new Error('Backblaze B2 credentials missing. Please set B2_KEY_ID and B2_APPLICATION_KEY in server environment.');
  }

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
      // Force path style is standard for S3-compatible endpoints
      forcePathStyle: true,
    });
  }
  return cachedS3Client;
}

export function isB2Configured() {
  const config = getStorageConfig();
  return Boolean(config.keyId && config.applicationKey);
}

// MIME & Extension Validation
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/avif': ['avif'],
  'image/svg+xml': ['svg'],
  // Videos
  'video/mp4': ['mp4', 'm4v'],
  'video/webm': ['webm'],
  'video/quicktime': ['mov'],
  'video/ogg': ['ogg', 'ogv'],
  // Documents
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/json': ['json'],
};

export function validateMediaMeta({ fileName, mimeType, size }) {
  const config = getStorageConfig();
  const safeName = String(fileName || '').trim();
  const safeMime = String(mimeType || '').trim().toLowerCase();
  const safeSize = Number(size) || 0;

  if (!safeName) {
    throw new Error('Filename is required');
  }

  if (safeSize <= 0) {
    throw new Error('File size must be greater than 0 bytes');
  }

  if (safeSize > config.maxUploadSizeBytes) {
    throw new Error(`File size (${(safeSize / (1024 * 1024 * 1024)).toFixed(2)} GB) exceeds maximum limit of ${config.maxUploadSizeBytes / (1024 * 1024 * 1024)} GB`);
  }

  const extMatch = safeName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (!safeMime || !ALLOWED_MIME_TYPES[safeMime]) {
    throw new Error(`MIME type "${safeMime}" is not supported.`);
  }

  const validExts = ALLOWED_MIME_TYPES[safeMime] || [];
  if (ext && !validExts.includes(ext)) {
    throw new Error(`File extension ".${ext}" does not match declared MIME type "${safeMime}".`);
  }

  let mediaType = 'document';
  if (safeMime.startsWith('image/')) mediaType = 'image';
  else if (safeMime.startsWith('video/')) mediaType = 'video';
  else if (safeMime.startsWith('audio/')) mediaType = 'audio';

  if (mediaType === 'video' && safeSize > config.maxVideoSizeBytes) {
    throw new Error(`Video file size exceeds maximum video limit of ${config.maxVideoSizeBytes / (1024 * 1024 * 1024)} GB`);
  }

  return {
    valid: true,
    mediaType,
    extension: ext || validExts[0],
    sanitizedName: sanitizeFileName(safeName),
  };
}

export function sanitizeFileName(fileName) {
  return String(fileName || 'file')
    .replace(/\\|\//g, '_')
    .replace(/\.{2,}/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 120);
}

/**
 * Deterministic, safe storage key design:
 * media/{environment}/{ownerId}/{mediaType}/{yyyy}/{mm}/{uuid}-{sanitized-name}
 */
export function generateObjectKey({ ownerId, mediaType, fileName, folder = 'general' }) {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const cleanOwnerId = String(ownerId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 40);
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const uid = crypto.randomUUID();
  const cleanName = sanitizeFileName(fileName || 'file');

  return `media/${env}/${cleanOwnerId}/${folder}/${mediaType}/${yyyy}/${mm}/${uid}-${cleanName}`;
}

/**
 * Dynamic part size calculation for multipart uploads.
 * S3 allows up to 10,000 parts.
 * Backblaze B2 minimum part size is 5MB.
 */
export function calculatePartSizing(fileSize) {
  const config = getStorageConfig();
  const minPartSize = config.minPartSizeBytes; // e.g. 10MB
  const maxParts = 10000;

  let partSize = minPartSize;

  // Scale part size for large files
  if (fileSize > 100 * 1024 * 1024 * 1024) { // > 100 GB
    partSize = 100 * 1024 * 1024; // 100 MB parts
  } else if (fileSize > 20 * 1024 * 1024 * 1024) { // > 20 GB
    partSize = 50 * 1024 * 1024; // 50 MB parts
  } else if (fileSize > 2 * 1024 * 1024 * 1024) { // > 2 GB
    partSize = 25 * 1024 * 1024; // 25 MB parts
  } else if (fileSize > 500 * 1024 * 1024) { // > 500 MB
    partSize = 15 * 1024 * 1024; // 15 MB parts
  }

  // Ensure total parts <= 10,000
  if (Math.ceil(fileSize / partSize) > maxParts) {
    partSize = Math.ceil(fileSize / maxParts);
  }

  const totalParts = Math.max(1, Math.ceil(fileSize / partSize));

  return { partSize, totalParts };
}

/**
 * 1. Single Part Upload - Presigned PUT URL
 */
export async function createSinglePartUpload({ ownerId, fileName, mimeType, size, visibility = 'public', folder = 'uploads', metadata = {} }) {
  const validation = validateMediaMeta({ fileName, mimeType, size });
  const objectKey = generateObjectKey({ ownerId, mediaType: validation.mediaType, fileName: validation.sanitizedName, folder });
  const config = getStorageConfig();
  const client = getB2Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: mimeType,
    Metadata: {
      ownerid: String(ownerId),
      originalname: encodeURIComponent(fileName),
      visibility: String(visibility),
      ...metadata,
    },
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    isMultipart: false,
    objectKey,
    uploadUrl,
    visibility,
    mediaType: validation.mediaType,
    sanitizedName: validation.sanitizedName,
    size,
    mimeType,
  };
}

/**
 * 2. Multipart Upload - Create Multipart Session
 */
export async function createMultipartUploadSession({ ownerId, fileName, mimeType, size, visibility = 'public', folder = 'uploads', metadata = {} }) {
  const validation = validateMediaMeta({ fileName, mimeType, size });
  const objectKey = generateObjectKey({ ownerId, mediaType: validation.mediaType, fileName: validation.sanitizedName, folder });
  const config = getStorageConfig();
  const client = getB2Client();
  const { partSize, totalParts } = calculatePartSizing(size);

  const command = new CreateMultipartUploadCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: mimeType,
    Metadata: {
      ownerid: String(ownerId),
      originalname: encodeURIComponent(fileName),
      visibility: String(visibility),
      ...metadata,
    },
  });

  const response = await client.send(command);
  const uploadId = response.UploadId;

  return {
    isMultipart: true,
    uploadId,
    objectKey,
    partSize,
    totalParts,
    visibility,
    mediaType: validation.mediaType,
    sanitizedName: validation.sanitizedName,
    size,
    mimeType,
  };
}

/**
 * 3. Generate Presigned URLs for Specific Multipart Parts
 */
export async function getPartUploadUrls({ objectKey, uploadId, partNumbers = [] }) {
  if (!objectKey || !uploadId || !Array.isArray(partNumbers) || partNumbers.length === 0) {
    throw new Error('objectKey, uploadId, and non-empty partNumbers array are required');
  }

  const config = getStorageConfig();
  const client = getB2Client();

  const parts = await Promise.all(
    partNumbers.map(async (partNumber) => {
      const pNum = parseInt(partNumber, 10);
      const command = new UploadPartCommand({
        Bucket: config.bucket,
        Key: objectKey,
        UploadId: uploadId,
        PartNumber: pNum,
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      return {
        partNumber: pNum,
        uploadUrl,
      };
    })
  );

  return { objectKey, uploadId, parts };
}

/**
 * 4. Complete Multipart Upload & Verify
 */
export async function completeMultipartUpload({ objectKey, uploadId, parts, expectedSize }) {
  if (!objectKey || !uploadId || !Array.isArray(parts) || parts.length === 0) {
    throw new Error('objectKey, uploadId, and parts array with { PartNumber, ETag } are required');
  }

  const config = getStorageConfig();
  const client = getB2Client();

  // Parts must be sorted in ascending order by PartNumber per S3 spec
  const sortedParts = parts
    .map(p => ({
      PartNumber: parseInt(p.PartNumber || p.partNumber, 10),
      ETag: String(p.ETag || p.etag).trim().replace(/^"|"$/g, ''), // Normalize quotes
    }))
    .sort((a, b) => a.PartNumber - b.PartNumber);

  // Complete Multipart on B2
  const completeCommand = new CompleteMultipartUploadCommand({
    Bucket: config.bucket,
    Key: objectKey,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts.map(p => ({
        PartNumber: p.PartNumber,
        ETag: `"${p.ETag}"`, // S3 requires quoted ETags in XML
      })),
    },
  });

  const completeResult = await client.send(completeCommand);

  // Verify object on B2 with HeadObject
  const head = await verifyObjectIntegrity({ objectKey, expectedSize });

  return {
    verified: true,
    objectKey,
    location: completeResult.Location,
    etag: head.etag,
    size: head.size,
    contentType: head.contentType,
    completedAt: new Date().toISOString(),
  };
}

/**
 * 5. Abort Multipart Upload
 */
export async function abortMultipartUpload({ objectKey, uploadId }) {
  if (!objectKey || !uploadId) return false;

  const config = getStorageConfig();
  const client = getB2Client();

  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: config.bucket,
      Key: objectKey,
      UploadId: uploadId,
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.warn(`[B2Storage] Failed to abort multipart upload ${uploadId}:`, err.message);
    return false;
  }
}

/**
 * 6. Verify Object Integrity via HeadObject
 */
export async function verifyObjectIntegrity({ objectKey, expectedSize }) {
  const config = getStorageConfig();
  const client = getB2Client();

  const command = new HeadObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
  });

  const head = await client.send(command);

  if (expectedSize !== undefined && expectedSize !== null) {
    const actualSize = Number(head.ContentLength);
    const exp = Number(expectedSize);
    if (actualSize !== exp) {
      throw new Error(`Object size mismatch for key ${objectKey}: expected ${exp} bytes, found ${actualSize} bytes on B2.`);
    }
  }

  return {
    exists: true,
    size: Number(head.ContentLength),
    contentType: head.ContentType,
    etag: String(head.ETag || '').replace(/^"|"$/g, ''),
    lastModified: head.LastModified?.toISOString?.() || new Date().toISOString(),
    metadata: head.Metadata || {},
  };
}

/**
 * 7. Delete Object from B2
 */
export async function deleteObject({ objectKey }) {
  if (!objectKey) return false;

  const config = getStorageConfig();
  const client = getB2Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
  });

  await client.send(command);
  return true;
}

/**
 * 8. Media Delivery URL Builder
 * - Public media: Cloudflare CDN URL
 * - Private / members media: Short-lived presigned GET URL (never unrestricted CDN access)
 */
export async function buildDeliveryUrl({ objectKey, visibility = 'public', expiresIn = 3600 }) {
  const config = getStorageConfig();

  if (visibility === 'public') {
    return `${config.cdnBaseUrl}/${objectKey}`;
  }

  // Private media requires secure, time-limited presigned GET URL
  const client = getB2Client();
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * 9. Cleanup Stale Multipart Uploads
 */
export async function cleanupStaleMultipartUploads({ maxAgeHours = 24 } = {}) {
  const config = getStorageConfig();
  const client = getB2Client();
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  const aborted = [];

  try {
    const command = new ListMultipartUploadsCommand({
      Bucket: config.bucket,
    });
    const response = await client.send(command);
    const uploads = response.Uploads || [];

    for (const u of uploads) {
      const initiated = new Date(u.Initiated).getTime();
      if (initiated < cutoff) {
        try {
          await abortMultipartUpload({ objectKey: u.Key, uploadId: u.UploadId });
          aborted.push({ key: u.Key, uploadId: u.UploadId, initiated: u.Initiated });
        } catch (err) {
          console.warn(`[B2 Cleanup] Error aborting ${u.UploadId}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('[B2 Cleanup] Failed to list multipart uploads:', err.message);
  }

  return { abortedCount: aborted.length, aborted };
}
