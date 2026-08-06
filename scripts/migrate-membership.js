/**
 * Database Migration Script: Membership System Refactor
 * 
 * This script migrates existing users to the new membership system:
 * - Users with role = 'Member' keep their role and set membershipStatus = 'approved'
 * - All other users get membershipStatus = 'none'
 * - Adds membershipStatus field to users and publicProfiles collections
 */

/* eslint-disable */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateMembership() {
  console.log('Starting membership migration...');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs;
    
    console.log(`Found ${users.length} users to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process in batches of 500
    const batchSize = 500;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchUsers = users.slice(i, i + batchSize);
      
      for (const userDoc of batchUsers) {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        try {
          const userRef = doc(db, 'users', userId);
          const publicProfileRef = doc(db, 'publicProfiles', userId);
          
          // Determine membership status
          let membershipStatus = 'none';
          if (userData.role === 'Member' || userData.role === 'Main CEO' || userData.role === 'Co-CEO' || userData.role === 'Leader') {
            membershipStatus = 'approved';
          }
          
          // Update user document
          batch.update(userRef, {
            membershipStatus: membershipStatus
          });
          
          // Update public profile document
          batch.update(publicProfileRef, {
            membershipStatus: membershipStatus
          });
          
          migratedCount++;
          console.log(`Migrated user ${userId} with role ${userData.role} -> membershipStatus: ${membershipStatus}`);
          
        } catch (error) {
          console.error(`Error migrating user ${userId}:`, error);
          errorCount++;
        }
      }
      
      // Commit the batch
      await batch.commit();
      console.log(`Batch ${Math.floor(i / batchSize) + 1} committed`);
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Migration complete!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateMembership()
  .then(() => {
    console.log('Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
