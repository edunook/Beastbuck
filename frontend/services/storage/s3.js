import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET || 'beastbuck';

// Security constraints
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

let s3Client = null;

export const isS3Configured = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);

function getS3Client() {
  if (!s3Client && isS3Configured) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function validateFile(file) {
  // Check file size based on type
  let maxSize = MAX_DOCUMENT_SIZE;
  if (file.type.startsWith('image/')) {
    maxSize = MAX_IMAGE_SIZE;
  } else if (file.type.startsWith('video/')) {
    maxSize = MAX_VIDEO_SIZE;
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
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
  return 'document';
}



export async function uploadFile(file, { folder = 'uploads' } = {}) {
  if (!isS3Configured) {
    throw new Error('AWS S3 is not configured. Please set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY.');
  }

  const client = getS3Client();
  if (!client) {
    throw new Error('Failed to initialize S3 client.');
  }

  // Validate file before upload
  validateFile(file);

  const resourceType = getResourceType(file);
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const key = `${folder}/${fileName}`;

  try {
    // Convert File to ArrayBuffer for AWS SDK compatibility
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: uint8Array,
      ContentType: file.type,
    });

    await client.send(command);

    // Construct public URL (assuming bucket is public or has proper CORS)
    const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return {
      type: resourceType,
      name: file.name,
      url: url,
      key: key,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      provider: 'aws-s3',
    };
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`, { cause: error });
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

export async function deleteFile(key) {
  if (!isS3Configured) {
    throw new Error('AWS S3 is not configured.');
  }

  const client = getS3Client();
  if (!client) {
    throw new Error('Failed to initialize S3 client.');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    throw new Error(`S3 delete failed: ${error.message}`, { cause: error });
  }
}
