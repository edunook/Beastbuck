/**
 * Script to locate specific Pinata/IPFS asset and audit all collections in Firestore
 */
import { getAdminApp } from './firebase-admin-init.mjs';

const TARGET_CID = 'bafybeifo2tilbzqvr34u2vnutsilbu36tohewsg7y6owit4q7qsgdeqtwm';

async function main() {
  const { db } = await getAdminApp();
  console.log(`Searching Firestore for CID: ${TARGET_CID} and all IPFS/Pinata occurrences...\n`);

  const collections = await db.listCollections();
  console.log(`Found ${collections.length} top-level collections:`);
  console.log(collections.map(c => c.id).join(', '));
  console.log('\n--- Scanning Collections ---');

  let foundTarget = false;
  const ipfsOccurrences = [];

  for (const col of collections) {
    const colName = col.id;
    const snapshot = await col.get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const str = JSON.stringify(data);

      if (str.includes(TARGET_CID)) {
        foundTarget = true;
        console.log(`\n>>> [MATCH FOUND] Collection: "${colName}", Doc ID: "${doc.id}"`);
        console.log('Full Document Data:');
        console.log(JSON.stringify(data, null, 2));
      }

      if (str.includes('pinata') || str.includes('/ipfs/')) {
        ipfsOccurrences.push({
          collection: colName,
          docId: doc.id,
          data,
        });
      }
    }
  }

  if (!foundTarget) {
    console.log(`\nTarget CID "${TARGET_CID}" was NOT found in any top-level collection.`);
  }

  console.log(`\nTotal documents with Pinata/IPFS references: ${ipfsOccurrences.length}`);
  for (const item of ipfsOccurrences) {
    console.log(`- Collection: ${item.collection} | Doc: ${item.docId}`);
  }
}

main().catch(err => {
  console.error('[Error]', err);
  process.exit(1);
});
