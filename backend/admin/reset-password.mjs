/**
 * Manually reset a user's password by username.
 *
 * Usage:
 *   npm run admin:reset-password -- myusername NewPassword123
 */
import { getAdminApp } from './firebase-admin-init.mjs';

const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
  console.error('Usage: npm run admin:reset-password -- <username> <newPassword>');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

const normalized = username.toLowerCase().trim();
const { db, auth } = await getAdminApp();

const usernameSnap = await db.collection('usernames').doc(normalized).get();
if (!usernameSnap.exists) {
  console.error(`Username "@${normalized}" not found.`);
  process.exit(1);
}

const { uid } = usernameSnap.data();
await auth.updateUser(uid, { password: newPassword });
console.log(`[Password Reset] Password updated for @${normalized}`);
