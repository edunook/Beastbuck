import { errorHandler } from '@shared/utils/errorHandler';

const PINATA_API_KEY = 'b08efa6f2e9836bc4404';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export async function uploadToPinata(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = new Error('Failed to upload to Pinata');
      errorHandler.error(error, 'Pinata Upload', { fileName: file.name, fileSize: file.size }, true);
      throw error;
    }

    const data = await response.json();
    return {
      cid: data.IpfsHash,
      url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    errorHandler.error(error, 'Pinata Upload', { fileName: file.name }, true);
    throw error;
  }
}

export async function uploadJSONToPinata(jsonData, name) {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_API_KEY}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name || 'uploaded-data',
        },
      }),
    });

    if (!response.ok) {
      const error = new Error('Failed to upload JSON to Pinata');
      errorHandler.error(error, 'Pinata JSON Upload', { name }, true);
      throw error;
    }

    const data = await response.json();
    return {
      cid: data.IpfsHash,
      url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
    };
  } catch (error) {
    errorHandler.error(error, 'Pinata JSON Upload', { name }, true);
    throw error;
  }
}
