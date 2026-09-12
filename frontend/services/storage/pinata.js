/**
 * Pinata Storage Facade (Deprecated -> Migrated to Backblaze B2 & Cloudflare CDN)
 * Re-exports from unified storage for backward compatibility.
 */

import { uploadFile } from './b2Client';

export async function uploadToPinata(file) {
  const result = await uploadFile(file);
  return {
    cid: result.key,
    url: result.url || result.cdnUrl,
    name: result.name,
    size: result.size,
    type: result.mimeType,
  };
}

export async function uploadJSONToPinata(jsonData, name) {
  const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const jsonFile = new File([jsonBlob], `${name || 'uploaded-data'}.json`, { type: 'application/json' });
  const result = await uploadFile(jsonFile);
  return {
    cid: result.key,
    url: result.url || result.cdnUrl,
  };
}
