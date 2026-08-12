import { auth, db } from '@services/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp, writeBatch, runTransaction, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ROLES } from '@shared/constants/roles';

export const AuthService = {
  normalizeUsername(username) {
    return username.toLowerCase().trim();
  },

  validateUsername(username) {
    const normalized = this.normalizeUsername(username);

    if (normalized.length < 3) {
      return 'Username must be at least 3 characters';
    }

    if (!/^[a-z0-9_]+$/.test(normalized)) {
      return 'Username can only use lowercase letters, numbers, and underscores';
    }

    return null;
  },

  getAuthEmailForUsername(username) {
    const normalized = this.normalizeUsername(username);
    return `${normalized}@beastbuck.local`;
  },

  normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '');
  },

  /**
   * Check if a username is available
   */
  async checkUsernameAvailable(username) {
    const normalized = this.normalizeUsername(username);
    if (!normalized) return false;
    const docRef = doc(db, 'usernames', normalized);
    const snap = await getDoc(docRef);
    return !snap.exists();
  },

  /**
   * Register a new user with username reservation
   * Automatically assigns Main CEO role to the very first user (atomic transaction)
   */
  async signUp(phoneNumber, password, username, avatar = '') {
    // Input sanitization
    const sanitizedUsername = username?.trim() || '';
    const sanitizedPhone = phoneNumber?.trim() || '';
    const sanitizedAvatar = avatar?.trim() || '';

    const normalizedUsername = this.normalizeUsername(sanitizedUsername);
    const usernameError = this.validateUsername(normalizedUsername);
    const normalizedPhoneNumber = sanitizedPhone;

    if (usernameError) {
      throw new Error(usernameError);
    }

    if (!normalizedPhoneNumber) {
      throw new Error('Phone number is required.');
    }

    // Additional security: rate limiting placeholder
    // In a real implementation, track attempts by IP/user-agent

    // Basic rate limiting attempt (implement proper rate limiting in production)
    const lastAttempt = localStorage.getItem('lastSignupAttempt');
    if (lastAttempt && Date.now() - parseInt(lastAttempt) < 60000) { // 1 minute cooldown
      throw new Error('Too many signup attempts. Please wait 1 minute before trying again.');
    }
    localStorage.setItem('lastSignupAttempt', Date.now().toString());

    const authEmail = this.getAuthEmailForUsername(normalizedUsername);

    // Firebase Auth requires an email for password auth, so BeastBuck uses
    // an internal username-derived email that members never type.
    let cred;

    try {
      cred = await createUserWithEmailAndPassword(auth, authEmail, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Username is already taken.', { cause: err });
      }

      throw err;
    }

    const user = cred.user;

    await updateProfile(user, { displayName: normalizedUsername, photoURL: sanitizedAvatar });

    try {
      // Use transaction for atomic first-user detection and role assignment
      // This prevents race conditions where two users could both become CEO
      await runTransaction(db, async (transaction) => {
        // Check if this is the first user by counting existing users
        // We use a limited query to get just one user to check if any exist
        const usersQuery = query(collection(db, 'users'), orderBy('joinedAt', 'asc'), limit(1));
        const usersSnapshot = await getDocs(usersQuery);

        const isFirstUser = usersSnapshot.empty;

        // Determine role based on whether this is the first user
        const userRole = isFirstUser ? ROLES.MAIN_CEO : ROLES.USER;
        const membershipStatus = isFirstUser ? 'approved' : 'none';

        // Prepare the user document
        const userRef = doc(db, 'users', user.uid);
        const usernameRef = doc(db, 'usernames', normalizedUsername);
        const publicProfileRef = doc(db, 'publicProfiles', user.uid);

        // Set username document
        transaction.set(usernameRef, {
          uid: user.uid,
          normalizedUsername,
          authEmail,
          phoneNumber: normalizedPhoneNumber,
          createdAt: serverTimestamp()
        });

        // Set user document with appropriate role
        transaction.set(userRef, {
          uid: user.uid,
          username: normalizedUsername,
          displayName: normalizedUsername,
          authEmail,
          phoneNumber: normalizedPhoneNumber,
          avatar: sanitizedAvatar,
          role: userRole,
          membershipStatus: membershipStatus,
          xp: 0,
          level: 1,
          specializations: [],
          achievements: [],
          joinedAt: serverTimestamp(),
          stats: {
            tasksCompleted: 0,
            experimentsCount: 0,
            productsCount: 0,
            messagesSent: 0,
            achievementsEarned: 0,
          },
          profileCustomization: {},
          isExecutive: isFirstUser, // Mark as executive if CEO
        });

        // Set public profile document
        transaction.set(publicProfileRef, {
          uid: user.uid,
          username: normalizedUsername,
          displayName: normalizedUsername,
          avatar: sanitizedAvatar,
          role: userRole,
          xp: 0,
          level: 1,
          specializations: [],
          achievements: [],
          certificates: [],
          inventions: [],
          research: [],
          projects: [],
          portfolios: [],
          activity: '',
          reputation: 0,
          stats: {
            experimentsCount: 0,
            productsCount: 0,
            projectsCount: 0,
          },
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // If this is the first user (CEO), log the assignment in audit logs
        if (isFirstUser) {
          const auditLogRef = doc(collection(db, 'auditLogs'));
          transaction.set(auditLogRef, {
            type: 'CEO_ASSIGNED',
            actorId: user.uid,
            targetId: user.uid,
            summary: 'First user automatically assigned as Main CEO',
            metadata: { autoAssigned: true, isFirstUser: true },
            createdAt: serverTimestamp()
          });
        }
      });

      return { user, error: null };
    } catch (err) {
      // If profile document creation fails, clean up the auth user.
      await user.delete();
      throw err;
    }
  },

  /**
   * Verify username + phone for account recovery (no auth required).
   */
  async verifyRecoveryCredentials(username, phoneNumber) {
    const normalizedUsername = this.normalizeUsername(username?.trim() || '');
    const usernameError = this.validateUsername(normalizedUsername);

    if (usernameError) {
      throw new Error(usernameError);
    }

    const providedPhone = this.normalizePhone(phoneNumber);
    if (!providedPhone) {
      throw new Error('Phone number is required.');
    }

    const snap = await getDoc(doc(db, 'usernames', normalizedUsername));
    if (!snap.exists()) {
      throw new Error('Account not found. Check your username or create an account.');
    }

    const data = snap.data();
    const storedPhone = this.normalizePhone(data.phoneNumber);

    if (!storedPhone || storedPhone !== providedPhone) {
      throw new Error('Phone number does not match our records.');
    }

    return {
      uid: data.uid,
      authEmail: data.authEmail,
      normalizedUsername,
    };
  },

  /**
   * Queue a password reset after identity verification.
   * Processed server-side via backend/admin/process-password-resets.mjs
   */
  async submitPasswordResetRequest(username, phoneNumber, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const lastRequest = localStorage.getItem('lastPasswordResetRequest');
    if (lastRequest && Date.now() - parseInt(lastRequest, 10) < 300000) {
      throw new Error('Please wait 5 minutes before submitting another reset request.');
    }

    const { uid, normalizedUsername } = await this.verifyRecoveryCredentials(username, phoneNumber);

    await addDoc(collection(db, 'passwordResetRequests'), {
      uid,
      username: normalizedUsername,
      phoneNumber: this.normalizePhone(phoneNumber),
      status: 'pending',
      requestedAt: serverTimestamp(),
      newPassword,
    });

    localStorage.setItem('lastPasswordResetRequest', Date.now().toString());
    return { success: true };
  },

  clearLoginAttempts() {
    localStorage.removeItem('lastLoginAttempt');
    localStorage.removeItem('loginAttemptCount');
  },

  /**
   * Sign in with username and password.
   * Firebase Auth still requires email internally, so the username index resolves it.
   */
  async signIn(username, password) {
    // Input sanitization
    const sanitizedUsername = username?.trim() || '';
    const sanitizedPassword = password?.trim() || '';
    
    const normalizedUsername = this.normalizeUsername(sanitizedUsername);
    const usernameError = this.validateUsername(normalizedUsername);

    if (usernameError) {
      throw new Error(usernameError);
    }

    if (!sanitizedPassword) {
      throw new Error('Password is required.');
    }

    const lastLoginAttempt = localStorage.getItem('lastLoginAttempt');
    let loginAttemptCount = parseInt(localStorage.getItem('loginAttemptCount') || '0', 10);

    if (lastLoginAttempt && Date.now() - parseInt(lastLoginAttempt, 10) >= 300000) {
      loginAttemptCount = 0;
    }

    if (lastLoginAttempt && Date.now() - parseInt(lastLoginAttempt, 10) < 300000 && loginAttemptCount >= 5) {
      throw new Error('Too many failed login attempts. Please wait 5 minutes before trying again.');
    }

    const authEmail = this.getAuthEmailForUsername(normalizedUsername);

    try {
      const result = await signInWithEmailAndPassword(auth, authEmail, sanitizedPassword);
      this.clearLoginAttempts();
      return result;
    } catch (err) {
      localStorage.setItem('loginAttemptCount', String(loginAttemptCount + 1));
      localStorage.setItem('lastLoginAttempt', Date.now().toString());
      throw err;
    }
  },

  /**
   * Change password for the currently signed-in user.
   */
  async changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;

    if (!user?.email) {
      throw new Error('You must be signed in to change your password.');
    }

    if (!currentPassword) {
      throw new Error('Current password is required.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from your current password.');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true };
  },

  /**
   * Logout
   */
  async logOut() {
    this.clearLoginAttempts();
    return await signOut(auth);
  }
};
