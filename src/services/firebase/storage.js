import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Security constraints
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Security: Blocked dangerous MIME types
const BLOCKED_MIME_TYPES = [
  'application/javascript',
  'text/html',
  'application/x-xss-html',
  'text/javascript',
  'application/x-httpd-php',
  'application/xml',
  'text/xml'
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

export const isFirebaseStorageConfigured = Boolean(storage);

/**
 * Comprehensive file validation with security checks
 * @param {File} file - File to validate
 * @throws {Error} If validation fails
 */
function validateFile(file) {
  // 1. Null/undefined check
  if (!file) {
    throw new Error('No file provided');
  }

  // 2. File size check
  if (file.size === 0) {
    throw new Error('Empty file not allowed');
  }

  // 3. File size limit based on type
  let maxSize = MAX_DOCUMENT_SIZE;
  if (file.type.startsWith('image/')) {
    maxSize = MAX_IMAGE_SIZE;
  } else if (file.type.startsWith('video/')) {
    maxSize = MAX_VIDEO_SIZE;
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
  }

  // 4. MIME type validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, SVG), PDF, documents (DOC, DOCX), and videos (MP4, WebM, OGG)`);
  }

  // 5. Security: Block dangerous MIME types
  if (BLOCKED_MIME_TYPES.some(type => file.type.includes(type))) {
    throw new Error('Potentially dangerous file type detected');
  }

  // 6. Filename validation
  if (!file.name || file.name.length > 255) {
    throw new Error('Invalid filename');
  }

  // 7. Extension check
  const ext = file.name.toLowerCase().split('.').pop();
  const allowedExts = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
    document: ['pdf', 'doc', 'docx', 'txt', 'csv', 'json']
  };

  const resourceType = getResourceType(file);
  const validExts = allowedExts[resourceType] || [];
  if (!validExts.includes(ext)) {
    throw new Error(`Invalid file extension: .${ext}`);
  }

  return true;
}

function getResourceType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}



export async function uploadFile(file, { folder = 'uploads' } = {}) {
  if (!isFirebaseStorageConfigured) {
    throw new Error('Firebase Storage is not configured.');
  }

  // Validate file before upload
  validateFile(file);

  const resourceType = getResourceType(file);
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const storagePath = `${folder}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    const url = await getDownloadURL(snapshot.ref);

    return {
      type: resourceType,
      name: file.name,
      url: url,
      path: storagePath,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      provider: 'firebase-storage',
    };
  } catch (error) {
    throw new Error(`Firebase Storage upload failed: ${error.message}`, { cause: error });
  }
}

export function uploadExperimentMedia(file) {
  return uploadFile(file, { folder: 'experiments' });
}

export function uploadChallengeMedia(file) {
  return uploadFile(file, { folder: 'challenges' });
}

export function uploadProductMedia(file) {
  return uploadFile(file, { folder: 'products' });
}

export function uploadCreativeMedia(file) {
  return uploadFile(file, { folder: 'creative' });
}

export function uploadFunFlixMedia(file) {
  return uploadFile(file, { folder: 'funflix' });
}

export function uploadProofFile(file, { folder = 'proof' } = {}) {
  return uploadFile(file, { folder });
}

export async function deleteFile(storagePath) {
  if (!isFirebaseStorageConfigured) {
    throw new Error('Firebase Storage is not configured.');
  }

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    throw new Error(`Firebase Storage delete failed: ${error.message}`, { cause: error });
  }
}
