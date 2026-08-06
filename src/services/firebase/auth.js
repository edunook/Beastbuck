import { auth, db } from './config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ROLES } from '../../constants/roles';

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
      const batch = writeBatch(db);
      const usernameRef = doc(db, 'usernames', normalizedUsername);
      const userRef = doc(db, 'users', user.uid);
      const publicProfileRef = doc(db, 'publicProfiles', user.uid);

      batch.set(usernameRef, {
        uid: user.uid,
        normalizedUsername,
        authEmail,
        phoneNumber: normalizedPhoneNumber,
        createdAt: serverTimestamp()
      });

      batch.set(userRef, {
        uid: user.uid,
        username: normalizedUsername,
        displayName: normalizedUsername,
        authEmail,
        phoneNumber: normalizedPhoneNumber,
        avatar: sanitizedAvatar,
        role: ROLES.USER,
        membershipStatus: 'none',
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
        profileCustomization: {}
      });

      batch.set(publicProfileRef, {
        uid: user.uid,
        username: normalizedUsername,
        displayName: normalizedUsername,
        avatar: sanitizedAvatar,
        role: ROLES.USER,
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

      await batch.commit();
      return { user, error: null };
    } catch (err) {
      // If profile document creation fails, clean up the auth user.
      await user.delete();
      throw err;
    }
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

    // Rate limiting for sign in attempts
    const lastLoginAttempt = localStorage.getItem('lastLoginAttempt');
    const loginAttemptCount = parseInt(localStorage.getItem('loginAttemptCount') || '0');
    
    if (lastLoginAttempt && Date.now() - parseInt(lastLoginAttempt) < 300000) { // 5 minutes
      if (loginAttemptCount >= 5) {
        throw new Error('Too many failed login attempts. Please wait 5 minutes before trying again.');
      }
      localStorage.setItem('loginAttemptCount', (loginAttemptCount + 1).toString());
    } else {
      // Reset counter after 5 minutes
      localStorage.setItem('loginAttemptCount', '1');
    }
    localStorage.setItem('lastLoginAttempt', Date.now().toString());

    const authEmail = this.getAuthEmailForUsername(normalizedUsername);
    console.log('Sign in attempt:', {
      username: normalizedUsername,
      authEmail,
      passwordLength: sanitizedPassword?.length
    });
    return await signInWithEmailAndPassword(auth, authEmail, sanitizedPassword);
  },

  /**
   * Logout
   */
  async logOut() {
    // Clear login attempt counters on logout
    localStorage.removeItem('lastLoginAttempt');
    localStorage.removeItem('loginAttemptCount');
    return await signOut(auth);
  }
};
