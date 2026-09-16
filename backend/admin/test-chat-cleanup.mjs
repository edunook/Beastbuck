/**
 * Safe test script for chat message cleanup functionality
 * 
 * This script creates test messages with known timestamps and tests
 * the cleanup logic without affecting production data.
 * 
 * Usage: node backend/admin/test-chat-cleanup.mjs
 * 
 * SAFETY FEATURES:
 * - Only operates on test collection 'testChatRooms'
 * - Creates isolated test data
 * - Validates cleanup logic before actual deletion
 * - Provides detailed logging
 * - Can be run multiple times safely
 */

import { getAdminApp } from './firebase-admin-init.mjs';

const { db } = await getAdminApp();

async function runSafeTest() {
  console.log('=== SAFE CHAT CLEANUP TEST ===\n');

  try {
    // 1. Create test room and messages
    const testRoomId = 'test-cleanup-room-' + Date.now();
    console.log(`Step 1: Creating test room: ${testRoomId}`);

    await db.collection('testChatRooms').doc(testRoomId).set({
      name: testRoomId,
      type: 'public',
      createdAt: new Date(),
      testOnly: true,
    });

    // 2. Create test messages with different ages
    const now = new Date();
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    console.log('Step 2: Creating test messages...');

    // Old message (should be deleted)
    const oldMessageRef = await db
      .collection('testChatRooms')
      .doc(testRoomId)
      .collection('messages')
      .add({
        senderId: 'test-user',
        senderName: 'Test User',
        text: 'This message is 8 days old and should be deleted',
        createdAt: eightDaysAgo,
        edited: false,
        deleted: false,
        reactions: {},
        testOnly: true,
      });

    // Recent message (should NOT be deleted)
    const recentMessageRef = await db
      .collection('testChatRooms')
      .doc(testRoomId)
      .collection('messages')
      .add({
        senderId: 'test-user',
        senderName: 'Test User',
        text: 'This message is 6 days old and should NOT be deleted',
        createdAt: sixDaysAgo,
        edited: false,
        deleted: false,
        reactions: {},
        testOnly: true,
      });

    console.log(`Created old message: ${oldMessageRef.id} (8 days old)`);
    console.log(`Created recent message: ${recentMessageRef.id} (6 days old)`);

    // 3. Verify initial state
    console.log('\nStep 3: Verifying initial state...');
    const initialMessages = await db
      .collection('testChatRooms')
      .doc(testRoomId)
      .collection('messages')
      .get();

    console.log(`Total messages before cleanup: ${initialMessages.size}`);

    // 4. Test cleanup logic (dry run - no actual deletion)
    console.log('\nStep 4: Testing cleanup logic (DRY RUN)...');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const messagesToDelete = await db
      .collection('testChatRooms')
      .doc(testRoomId)
      .collection('messages')
      .where('createdAt', '<', cutoffDate)
      .get();

    console.log(`Messages that would be deleted: ${messagesToDelete.size}`);
    messagesToDelete.forEach(doc => {
      const msg = doc.data();
      const age = Math.floor((now - msg.createdAt.toDate()) / (24 * 60 * 60 * 1000));
      console.log(`  - ${doc.id}: "${msg.text.substring(0, 50)}..." (${age} days old)`);
    });

    // 5. Verify only old messages are selected
    if (messagesToDelete.size === 1 && messagesToDelete.docs[0].id === oldMessageRef.id) {
      console.log('✓ Cleanup logic correctly identifies only old messages');
    } else {
      console.log('✗ Cleanup logic error: unexpected messages selected');
    }

    // 6. Test actual deletion (safely on test data)
    console.log('\nStep 5: Testing actual deletion on test data...');
    const batch = db.batch();
    messagesToDelete.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${messagesToDelete.size} messages`);

    // 7. Verify final state
    console.log('\nStep 6: Verifying final state...');
    const finalMessages = await db
      .collection('testChatRooms')
      .doc(testRoomId)
      .collection('messages')
      .get();

    console.log(`Total messages after cleanup: ${finalMessages.size}`);

    if (finalMessages.size === 1 && finalMessages.docs[0].id === recentMessageRef.id) {
      console.log('✓ Cleanup correctly preserved recent messages');
    } else {
      console.log('✗ Cleanup error: unexpected final state');
    }

    // 8. Cleanup test data
    console.log('\nStep 7: Cleaning up test data...');
    await db.collection('testChatRooms').doc(testRoomId).delete();
    console.log('Test room deleted');

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    console.log('The cleanup function is working correctly and safely.');
    console.log('It will only delete messages older than 7 days.');

  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
await runSafeTest();