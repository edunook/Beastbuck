/**
 * BeastBuck Storage Client
 * High-level storage facade replacing Pinata/IPFS with Backblaze B2 & Cloudflare CDN.
 */

import { B2Uploader } from './b2Uploader.js';

export const isStorageConfigured = true;

/** Resolved CDN base URL — falls back to direct B2 if env var not set */
const CDN_BASE = (
  import.meta.env.VITE_CDN_MEDIA_BASE_URL || '/api/media/file'
).replace(/\/+$/, '');

/**
 * Normalize any stored media URL to the current CDN base.
 * Rewrites old media.beastbuck.com or direct B2 URLs to the working CDN/proxy URL.
 * Safe to call on any string — returns it unchanged if it's not a media URL.
 */
export function normalizeMediaUrl(url) {
  if (!url) return url;
  if (typeof url !== 'string') return url;

  // Rewrite any old media.beastbuck.com URLs to current CDN base
  if (url.includes('media.beastbuck.com')) {
    const objectKey = url.replace(/^https?:\/\/media\.beastbuck\.com\/?/, '');
    return `${CDN_BASE}/${objectKey}`;
  }

  // Rewrite direct B2 URLs to proxy if CDN_BASE is a proxy route
  if (url.includes('backblazeb2.com/beastbuck-media')) {
    const objectKey = url.replace(/^https?:\/\/[^/]+\/beastbuck-media\/?/, '');
    return `${CDN_BASE}/${objectKey}`;
  }

  // Handle storage keys like 'media/dev/...' or folder prefixes
  if (url.startsWith('media/') || url.startsWith('profile-photos/') || url.startsWith('funflix/') || url.startsWith('creative/') || url.startsWith('products/') || url.startsWith('experiments/') || url.startsWith('challenges/') || url.startsWith('proof/')) {
    return `${CDN_BASE}/${url}`;
  }

  return url;
}

/**
 * Standard upload function
 * Returns uniform object: { id, name, url, cdnUrl, key, objectKey, size, type, status, uploadedAt }
 */
export async function uploadFile(file, options = {}) {
  if (!file) throw new Error('No file provided for upload');

  const uploader = new B2Uploader(file, options);
  const result = await uploader.start();

  return {
    id: result.mediaId,
    name: file.name,
    url: normalizeMediaUrl(result.url || result.cdnUrl),
    cdnUrl: normalizeMediaUrl(result.cdnUrl),
    key: result.objectKey,
    objectKey: result.objectKey,
    size: result.size || file.size,
    type: file.type?.startsWith('image/') ? 'image' : file.type?.startsWith('video/') ? 'video' : 'document',
    mimeType: file.type,
    status: result.status || 'ready',
    uploadedAt: result.completedAt || new Date().toISOString(),
    provider: 'backblaze-b2',
  };
}

export function uploadFunFlixMedia(file, options = {}) {
  return uploadFile(file, { folder: 'funflix', visibility: 'public', ...options });
}

export function uploadCreativeMedia(file, options = {}) {
  return uploadFile(file, { folder: 'creative', visibility: 'public', ...options });
}

export function uploadProductMedia(file, options = {}) {
  return uploadFile(file, { folder: 'products', visibility: 'public', ...options });
}

export function uploadExperimentMedia(file, options = {}) {
  return uploadFile(file, { folder: 'experiments', visibility: 'public', ...options });
}

export function uploadChallengeMedia(file, options = {}) {
  return uploadFile(file, { folder: 'challenges', visibility: 'public', ...options });
}

export function uploadProofFile(file, options = {}) {
  return uploadFile(file, { folder: 'proof', visibility: 'members', ...options });
}

export function uploadProfilePhoto(file, options = {}) {
  return uploadFile(file, { folder: 'profile-photos', visibility: 'public', ...options });
}

/**
 * Delete a media object from storage
 */
export async function deleteFile(objectKeyOrMediaId) {
  if (!objectKeyOrMediaId) return false;

  const payload = objectKeyOrMediaId.includes('/')
    ? { objectKey: objectKeyOrMediaId }
    : { mediaId: objectKeyOrMediaId };

  const res = await fetch('/api/media/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

/**
 * Get delivery URL for a media key
 */
export async function getMediaUrl(objectKey, { visibility = 'public' } = {}) {
  if (!objectKey) return null;
  if (visibility === 'public') {
    return `${CDN_BASE}/${objectKey}`;
  }

  const res = await fetch(`/api/media/delivery-url?key=${encodeURIComponent(objectKey)}&visibility=${visibility}`);
  const data = await res.json();
  return data.url;
}

// Fallback compatibility helpers
export function getGatewayUrl(pathOrKey) {
  if (!pathOrKey) return '';
  if (pathOrKey.startsWith('http://') || pathOrKey.startsWith('https://')) {
    return normalizeMediaUrl(pathOrKey); // rewrite old CDN domain if needed
  }
  return `${CDN_BASE}/${pathOrKey}`;
}

export function getBackupGatewayUrls(pathOrKey) {
  return [getGatewayUrl(pathOrKey)];
}

