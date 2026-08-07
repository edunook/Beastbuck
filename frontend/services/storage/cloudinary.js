// Re-export from IPFS storage for backward compatibility
export {
  uploadProofFile,
  uploadExperimentMedia,
  uploadChallengeMedia,
  uploadProductMedia,
  uploadCreativeMedia,
  uploadFunFlixMedia,
  isIPFSConfigured as isCloudinaryConfigured,
  deleteFile,
  getGatewayUrl,
  getBackupGatewayUrls,
} from './ipfs';
