import {
  createSinglePartUpload,
  createMultipartUploadSession,
  getPartUploadUrls,
  completeMultipartUpload,
  abortMultipartUpload,
  deleteObject,
  buildDeliveryUrl,
  verifyObjectIntegrity,
  validateMediaMeta,
  getStorageConfig,
} from './b2StorageService.js';
import crypto from 'node:crypto';

/**
 * Valid media status values:
 * pending -> uploading -> ready
 * failed, aborted, deleted
 */
export const MEDIA_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  READY: 'ready',
  FAILED: 'failed',
  ABORTED: 'aborted',
  DELETED: 'deleted',
};

/**
 * Initiate an upload session.
 * Decides between single-part presigned PUT and multipart upload based on MULTIPART_THRESHOLD_MB.
 */
export async function initiateUploadSession({
  ownerId,
  fileName,
  mimeType,
  size,
  visibility = 'public',
  folder = 'uploads',
  metadata = {},
  userRole = 'member',
  db = null, // Optional Firestore instance
}) {
  // Permission verification
  const role = String(userRole || 'member').toLowerCase().trim();
  if (role === 'explorer' || role === 'guest') {
    throw new Error('Explorers and guests do not have permission to upload media.');
  }

  // Validate metadata & size
  const metaValidation = validateMediaMeta({ fileName, mimeType, size });
  const config = getStorageConfig();
  const mediaId = crypto.randomUUID();

  const isMultipart = size > config.multipartThresholdBytes;

  let uploadDetails;
  if (isMultipart) {
    uploadDetails = await createMultipartUploadSession({
      ownerId,
      fileName,
      mimeType,
      size,
      visibility,
      folder,
      metadata: { mediaId, ...metadata },
    });
  } else {
    uploadDetails = await createSinglePartUpload({
      ownerId,
      fileName,
      mimeType,
      size,
      visibility,
      folder,
      metadata: { mediaId, ...metadata },
    });
  }

  const mediaRecord = {
    id: mediaId,
    ownerId,
    originalName: fileName,
    sanitizedName: metaValidation.sanitizedName,
    objectKey: uploadDetails.objectKey,
    mediaType: metaValidation.mediaType,
    mimeType,
    extension: metaValidation.extension,
    size,
    status: MEDIA_STATUS.UPLOADING,
    isMultipart,
    uploadId: uploadDetails.uploadId || null,
    partSize: uploadDetails.partSize || null,
    totalParts: uploadDetails.totalParts || 1,
    visibility,
    folder,
    cdnUrl: visibility === 'public' ? `${config.cdnBaseUrl}/${uploadDetails.objectKey}` : null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    deletedAt: null,
  };

  // If Firestore db is provided, persist media record
  if (db) {
    try {
      await db.collection('media').doc(mediaId).set(mediaRecord);
    } catch (err) {
      console.warn('[MediaService] Could not persist initial media record to Firestore:', err.message);
    }
  }

  return {
    mediaId,
    ...uploadDetails,
    record: mediaRecord,
  };
}

/**
 * Get presigned URLs for specific parts (Multipart)
 */
export async function getMultipartPartUrls({ objectKey, uploadId, partNumbers }) {
  return getPartUploadUrls({ objectKey, uploadId, partNumbers });
}

/**
 * Complete upload and transition status to READY
 */
export async function finalizeMediaUpload({
  mediaId,
  objectKey,
  uploadId,
  parts = [],
  expectedSize,
  isMultipart = false,
  visibility = 'public',
  db = null,
}) {
  let completionResult;

  if (isMultipart) {
    completionResult = await completeMultipartUpload({
      objectKey,
      uploadId,
      parts,
      expectedSize,
    });
  } else {
    // Single part verification
    completionResult = await verifyObjectIntegrity({
      objectKey,
      expectedSize,
    });
  }

  const deliveryUrl = await buildDeliveryUrl({ objectKey, visibility });

  const updates = {
    status: MEDIA_STATUS.READY,
    completedAt: new Date().toISOString(),
    checksum: completionResult.etag || null,
    verifiedSize: completionResult.size,
    cdnUrl: visibility === 'public' ? deliveryUrl : null,
  };

  if (db && mediaId) {
    try {
      await db.collection('media').doc(mediaId).set(updates, { merge: true });
    } catch (err) {
      console.warn(`[MediaService] Could not update media record ${mediaId} in Firestore:`, err.message);
    }
  }

  return {
    success: true,
    mediaId,
    objectKey,
    status: MEDIA_STATUS.READY,
    url: deliveryUrl,
    cdnUrl: visibility === 'public' ? deliveryUrl : null,
    size: completionResult.size,
    etag: completionResult.etag,
    completedAt: updates.completedAt,
  };
}

/**
 * Abort or cancel an ongoing upload
 */
export async function cancelMediaUpload({ mediaId, objectKey, uploadId, db = null }) {
  if (uploadId) {
    await abortMultipartUpload({ objectKey, uploadId });
  }

  if (db && mediaId) {
    try {
      await db.collection('media').doc(mediaId).set({
        status: MEDIA_STATUS.ABORTED,
        abortedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[MediaService] Failed to mark media ${mediaId} aborted:`, err.message);
    }
  }

  return { success: true, status: MEDIA_STATUS.ABORTED };
}

/**
 * Delete a media object from storage and mark deleted in DB
 */
export async function removeMedia({ mediaId, objectKey, db = null }) {
  if (objectKey) {
    await deleteObject({ objectKey });
  }

  if (db && mediaId) {
    try {
      await db.collection('media').doc(mediaId).set({
        status: MEDIA_STATUS.DELETED,
        deletedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[MediaService] Failed to mark media ${mediaId} deleted:`, err.message);
    }
  }

  return { success: true, status: MEDIA_STATUS.DELETED };
}
