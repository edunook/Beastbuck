const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Security constraints
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

function validateFile(file) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, SVG), PDF, documents (DOC, DOCX), and videos (MP4, WebM, OGG)`);
  }

  return true;
}

function getResourceType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'raw';
}

export async function uploadProofFile(file, { folder = 'beastbuck/proof' } = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary uploads are not configured.');
  }

  // Validate file before upload
  validateFile(file);

  const resourceType = getResourceType(file);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed.');
  }

  return {
    type: resourceType === 'raw' ? 'document' : resourceType,
    name: file.name,
    url: payload.secure_url,
    publicId: payload.public_id,
    format: payload.format,
    bytes: payload.bytes,
    uploadedAt: new Date().toISOString(),
    provider: 'cloudinary',
  };
}

export function uploadExperimentMedia(file) {
  return uploadProofFile(file, { folder: 'beastbuck/experiments' });
}

export function uploadChallengeMedia(file) {
  return uploadProofFile(file, { folder: 'beastbuck/challenges' });
}

export function uploadProductMedia(file) {
  return uploadProofFile(file, { folder: 'beastbuck/products' });
}
