/**
 * Storage service — delegates 100% to IPFS/Pinata (free, no credit card).
 * Firebase Storage is NOT used (it's a paid service).
 *
 * All upload functions return: { type, name, url, cid, path, size, uploadedAt, provider, backupUrls }
 * The `url` field is the primary Pinata gateway URL ready for direct use in <img src="..." />.
 */
export {
  uploadFile,
  uploadExperimentMedia,
  uploadChallengeMedia,
  uploadProductMedia,
  uploadCreativeMedia,
  uploadFunFlixMedia,
  uploadProofFile,
  deleteFile,
  getGatewayUrl,
  getBackupGatewayUrls,
  isIPFSConfigured as isStorageConfigured,
  isIPFSConfigured as isFirebaseStorageConfigured,
} from './ipfs';
