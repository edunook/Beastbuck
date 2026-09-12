/**
 * IPFS Storage Facade (Deprecated -> Migrated to Backblaze B2 & Cloudflare CDN)
 * Re-exports from unified storage for backward compatibility.
 */

export {
  uploadFile,
  uploadExperimentMedia,
  uploadChallengeMedia,
  uploadProductMedia,
  uploadCreativeMedia,
  uploadFunFlixMedia,
  uploadProofFile,
  uploadProfilePhoto,
  deleteFile,
  getMediaUrl,
  getGatewayUrl,
  getBackupGatewayUrls,
  isStorageConfigured as isIPFSConfigured,
} from './b2Client';
