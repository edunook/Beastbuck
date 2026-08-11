// IPFS-based decentralized storage with dual pinning
// Uses free pinning services for data durability

// Security constraints
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

// Multi-gateway delivery system (ordered by speed - Pinata first)
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',  // Fastest - dedicated Pinata gateway
  'https://ipfs.io/ipfs/',              // Reliable public gateway
  'https://dweb.link/ipfs/',            // Fast public gateway
  'https://gateway.ipfs.io/ipfs/',      // Official IPFS gateway
];

// Pinata free tier (no credit card required)
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export const isIPFSConfigured = Boolean(PINATA_API_KEY && PINATA_SECRET_KEY);

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

// Upload to Pinata (free tier, no credit card)
async function uploadToPinata(file) {
  if (!isIPFSConfigured) {
    throw new Error('Pinata is not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = {
    name: file.name,
    keyvalues: {
      type: getResourceType(file),
      uploadedAt: new Date().toISOString(),
    },
  };
  formData.append('pinataMetadata', JSON.stringify(metadata));

  const options = {
    cidVersion: 1,
  };
  formData.append('pinataOptions', JSON.stringify(options));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${data.error || data.message || 'Unknown error'}`);
  }

  return {
    cid: data.IpfsHash,
    size: data.PinSize,
    timestamp: data.Timestamp,
  };
}

// Get fastest working gateway URL
export function getGatewayUrl(cid, gatewayIndex = 0) {
  if (gatewayIndex >= IPFS_GATEWAYS.length) {
    gatewayIndex = 0; // Fallback to first gateway
  }
  return `${IPFS_GATEWAYS[gatewayIndex]}${cid}`;
}

// Get all backup gateway URLs
export function getBackupGatewayUrls(cid) {
  return IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`);
}

export async function uploadFile(file, { folder = 'uploads' } = {}) {
  if (!isIPFSConfigured) {
    throw new Error('IPFS storage is not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY.');
  }

  // Validate file before upload
  validateFile(file);

  const resourceType = getResourceType(file);

  try {
    // Upload to Pinata (primary pinning service)
    const pinataResult = await uploadToPinata(file);

    // Generate gateway URLs
    const primaryUrl = getGatewayUrl(pinataResult.cid);
    const backupUrls = getBackupGatewayUrls(pinataResult.cid);

    return {
      type: resourceType,
      name: file.name,
      url: primaryUrl,
      cid: pinataResult.cid,
      path: `${folder}/${pinataResult.cid}`,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      provider: 'ipfs-pinata',
      backupUrls: backupUrls,
      gateways: IPFS_GATEWAYS,
    };
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`, { cause: error });
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

export function uploadProfilePhoto(file) {
  return uploadFile(file, { folder: 'profile-photos' });
}

// Note: Deletion from IPFS is not guaranteed once pinned
// This function attempts to unpin from Pinata only
export async function deleteFile(cid) {
  if (!isIPFSConfigured) {
    throw new Error('IPFS storage is not configured.');
  }

  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unpin from Pinata');
    }

    return true;
  } catch (error) {
    throw new Error(`IPFS delete failed: ${error.message}`, { cause: error });
  }
}
