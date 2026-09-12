/**
 * BeastBuck Unified Storage Service
 * Powered by Backblaze B2 Object Storage + Cloudflare CDN Edge Delivery.
 * 
 * Replaces legacy Pinata/IPFS with direct browser-to-B2 presigned uploads,
 * parallel multipart chunks, retry resiliency, and IndexedDB session recovery.
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
  isStorageConfigured,
  isStorageConfigured as isIPFSConfigured,
  isStorageConfigured as isFirebaseStorageConfigured,
  isStorageConfigured as isCloudinaryConfigured,
} from './b2Client';

export { B2Uploader } from './b2Uploader';
