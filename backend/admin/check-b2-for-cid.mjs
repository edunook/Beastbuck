/**
 * Check if the target CID exists in Backblaze B2 bucket
 */
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const TARGET_CID = 'bafybeifo2tilbzqvr34u2vnutsilbu36tohewsg7y6owit4q7qsgdeqtwm';

async function main() {
  const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APPLICATION_KEY,
    },
    forcePathStyle: true,
  });

  console.log(`Searching B2 bucket "${process.env.B2_BUCKET}" for CID: ${TARGET_CID}...`);

  let continuationToken = undefined;
  let totalObjects = 0;
  const matches = [];

  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.B2_BUCKET,
      ContinuationToken: continuationToken,
    }));

    const contents = res.Contents || [];
    totalObjects += contents.length;

    for (const obj of contents) {
      if (obj.Key.includes(TARGET_CID) || obj.Key.includes('bafybei')) {
        matches.push(obj);
      }
    }

    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`Total objects scanned in B2: ${totalObjects}`);
  console.log(`Matches found: ${matches.length}`);
  if (matches.length > 0) {
    console.log('Matching objects:', JSON.stringify(matches, null, 2));
  } else {
    console.log('No object with this CID exists in B2 yet.');
  }
}

main().catch(err => {
  console.error('[Error]', err);
  process.exit(1);
});
