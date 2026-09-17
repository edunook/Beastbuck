import { getAdminApp } from '../admin/firebase-admin-init.mjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase client config from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase client app for development
let clientApp;
let clientDb;

function getClientApp() {
  if (!clientApp) {
    clientApp = initializeApp(firebaseConfig);
    clientDb = getFirestore(clientApp);
  }
  return { app: clientApp, db: clientDb };
}

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

  // Try to use Admin SDK first, fall back to client SDK
  try {
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
  } catch (adminError) {
    console.warn('[AuthService] Admin SDK failed, falling back to client SDK:', adminError.message);
    
    // Fallback to client SDK
    try {
      const { db } = getClientApp();
      const userDocSnap = await getDoc(doc(db, 'usernames', normUser));
      if (!userDocSnap.exists()) {
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
    } catch (clientError) {
      console.error('[AuthService] Both Admin and Client SDKs failed:', clientError.message);
      throw new Error('Verification failed. Please check your credentials and try again.');
    }
  }
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

  try {
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
  } catch (adminError) {
    console.error('[AuthService] Admin SDK password reset failed:', adminError.message);
    
    // If Admin SDK fails, provide a different approach for development
    throw new Error('Password reset requires Firebase Admin SDK credentials. Please configure FIREBASE_ADMIN_PRIVATE_KEY in your environment or use service-account.json file.');
  }
}
