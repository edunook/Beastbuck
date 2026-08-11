/**
 * Process pending password reset requests via Firebase Admin SDK.
 *
 * Usage:
 *   npm run admin:process-resets
 */
import { getAdminApp } from './firebase-admin-init.mjs';
import { FieldValue } from 'firebase-admin/firestore';

const { db, auth } = await getAdminApp();

const snap = await db
  .collection('passwordResetRequests')
  .where('status', '==', 'pending')
  .get();

if (snap.empty) {
  console.log('[Password Reset] No pending requests.');
  process.exit(0);
}

let processed = 0;

for (const docSnap of snap.docs) {
  const data = docSnap.data();
  const { uid, username, newPassword } = data;

  if (!uid || !newPassword) {
    console.warn(`[Password Reset] Skipping invalid request ${docSnap.id}`);
    continue;
  }

  try {
    await auth.updateUser(uid, { password: newPassword });
    await docSnap.ref.update({
      status: 'completed',
      completedAt: new Date(),
      newPassword: FieldValue.delete(),
    });
    processed += 1;
    console.log(`[Password Reset] Updated password for @${username}`);
  } catch (err) {
    await docSnap.ref.update({
      status: 'failed',
      failedAt: new Date(),
      error: err.message || 'Unknown error',
    });
    console.error(`[Password Reset] Failed for @${username}:`, err.message);
  }
}

console.log(`[Password Reset] Processed ${processed} of ${snap.size} request(s).`);
