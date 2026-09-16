import { getAdminApp } from '../admin/firebase-admin-init.mjs';

function normalizeUsername(username) {
  return String(username || '').toLowerCase().trim();
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Verify identity by matching registered username and phone number.
 */
export async function verifyRecovery(username, phoneNumber) {
  const normUser = normalizeUsername(username);
  if (!normUser) {
    throw new Error('Username is required.');
  }

  const normPhone = normalizePhone(phoneNumber);
  if (!normPhone) {
    throw new Error('Phone number is required.');
  }

  const { db } = await getAdminApp();

  const userDocSnap = await db.collection('usernames').doc(normUser).get();
  if (!userDocSnap.exists) {
    throw new Error('Account not found with this username.');
  }

  const userData = userDocSnap.data();
  const storedPhone = normalizePhone(userData.phoneNumber);

  if (!storedPhone || storedPhone !== normPhone) {
    throw new Error('Registered phone number does not match our records.');
  }

  return {
    valid: true,
    uid: userData.uid,
    username: normUser,
  };
}

/**
 * Reset password directly using Firebase Admin auth.updateUser after verifying credentials.
 */
export async function resetPassword({ username, phoneNumber, newPassword }) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.');
  }

  const { valid, uid, username: normUser } = await verifyRecovery(username, phoneNumber);
  if (!valid || !uid) {
    throw new Error('Verification failed. Unable to reset password.');
  }

  const { db, auth } = await getAdminApp();

  // Update Firebase Auth password immediately
  await auth.updateUser(uid, { password: newPassword });

  // Update user metadata in Firestore
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      passwordUpdatedAt: new Date(),
      updatedAt: new Date(),
    }).catch(() => {
      // Ignore if document schema doesn't match
    });

    // Mark any pending reset requests as completed
    const pendingRequests = await db
      .collection('passwordResetRequests')
      .where('uid', '==', uid)
      .where('status', '==', 'pending')
      .get();

    for (const docSnap of pendingRequests.docs) {
      await docSnap.ref.update({
        status: 'completed',
        completedAt: new Date(),
      }).catch(() => {});
    }

    // Log to auditLogs
    await db.collection('auditLogs').add({
      type: 'PASSWORD_RESET',
      actorId: uid,
      targetId: uid,
      summary: `Password reset successfully for @${normUser}`,
      createdAt: new Date(),
    }).catch(() => {});
  } catch (logErr) {
    console.warn('[AuthService] Non-critical post-reset update failed:', logErr.message);
  }

  return {
    success: true,
    message: 'Password has been updated successfully. You can now sign in.',
    username: normUser,
  };
}
