import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'beastbuck';

// Security constraints
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

let supabase = null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function getSupabase() {
  if (!supabase && isSupabaseConfigured) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
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
  if (!isSupabaseConfigured) {
    throw new Error('Supabase storage is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const client = getSupabase();
  if (!client) {
    throw new Error('Failed to initialize Supabase client.');
  }

  // Validate file before upload
  validateFile(file);

  const resourceType = getResourceType(file);
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `${folder}/${fileName}`;

  // Upload file to Supabase Storage
  const { error } = await client.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = client.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  return {
    type: resourceType,
    name: file.name,
    url: publicUrl,
    path: filePath,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    provider: 'supabase',
  };
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

export async function deleteFile(filePath) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase storage is not configured.');
  }

  const client = getSupabase();
  if (!client) {
    throw new Error('Failed to initialize Supabase client.');
  }

  const { error } = await client.storage
    .from(SUPABASE_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }

  return true;
}
