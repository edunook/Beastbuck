#!/usr/bin/env node
/**
 * Full Firestore scan for all Pinata/IPFS references across ALL collections
 * including publicProfiles, activityLogs, etc.
 */
import { getAdminApp } from './firebase-admin-init.mjs';

async function main() {
  const { db } = await getAdminApp();
  console.log('Scanning ALL Firestore collections for Pinata/IPFS references...\n');

  const collections = await db.listCollections();
  console.log(`Total top-level collections: ${collections.length}`);
  console.log(collections.map(c => c.id).join(', '));
  console.log('\n--- Scanning ---\n');

  const results = [];

  for (const col of collections) {
    const snapshot = await col.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const str = JSON.stringify(data);
      if (str.includes('pinata') || str.includes('/ipfs/') || str.includes('ipfsHash') || str.includes('photoCID')) {
        // Find which fields have IPFS values
        const ipfsFields = Object.entries(data).filter(([k, v]) => {
          const s = typeof v === 'string' ? v : JSON.stringify(v);
          return s.includes('pinata') || s.includes('/ipfs/') || (k === 'photoCID' && v);
        }).map(([k, v]) => ({ field: k, value: typeof v === 'string' ? v.substring(0, 120) : JSON.stringify(v).substring(0, 120) }));

        results.push({ collection: col.id, docId: doc.id, ipfsFields });
        console.log(`[${col.id}] ${doc.id}:`);
        for (const f of ipfsFields) {
          console.log(`  ${f.field}: ${f.value}`);
        }
      }
    }
  }

  console.log(`\n=== TOTAL: ${results.length} documents with IPFS/Pinata references ===`);
}

main().catch(err => {
  console.error('[Error]', err);
  process.exit(1);
});
