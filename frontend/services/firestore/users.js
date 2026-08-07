import { db, rtdb } from '@services/firebase/config';
import { ref, onValue } from 'firebase/database';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { SPECIALIZATIONS } from '@shared/constants/specializations';

export const UsersService = {
  /**
   * Fetch a user's complete profile
   */
  async getUserProfile(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getUidForUsername(username) {
    const normalizedUsername = username.toLowerCase().trim();
    const usernameRef = doc(db, 'usernames', normalizedUsername);
    const usernameSnap = await getDoc(usernameRef);
    return usernameSnap.exists() ? usernameSnap.data().uid : null;
  },

  subscribeToUserProfile(uid, { onProfile, onError }) {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(
      docRef,
      (snap) => {
        onProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  subscribeToPresence(uid, { onStatus }) {
    const statusRef = ref(rtdb, `/status/${uid}`);
    return onValue(statusRef, (snap) => {
      onStatus(snap.val() || { state: 'offline', last_changed: null });
    });
  },

  /**
   * Update a user's profile data
   */
  async updateProfile(uid, data) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  },

  /**
   * Update user profile with new fields for profile editing
   */
  async updateUserProfile(uid, data) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      displayName: data.displayName,
      bio: data.bio,
      location: data.location,
      website: data.website,
      company: data.company,
      education: data.education,
      interests: data.interests,
      customSections: data.customSections || [],
      theme: data.theme || 'default',
      updatedAt: new Date()
    });
  },

  async getSpecializations() {
    const merged = new Map(SPECIALIZATIONS.map(specialization => [specialization.id, specialization]));

    try {
      const specializationsRef = collection(db, 'specializations');
      const querySnapshot = await getDocs(specializationsRef);
      const stored = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const specialization of stored) {
        merged.set(specialization.id, {
          ...merged.get(specialization.id),
          ...specialization,
        });
      }
    } catch (err) {
      console.error('Specialization catalog read failed:', err);
    }

    return [...merged.values()];
  },

  async seedDefaultSpecializations(createdBy) {
    await Promise.all(SPECIALIZATIONS.map(specialization =>
      setDoc(doc(db, 'specializations', specialization.id), {
        ...specialization,
        createdBy,
      }, { merge: true })
    ));
  },

  async assignSpecialization(uid, specializationId) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      specializations: arrayUnion(specializationId),
    });
  },

  async removeSpecialization(uid, specializationId) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      specializations: arrayRemove(specializationId),
    });
  },

  async getUserActivity(uid, maxCount = 8) {
    const logsRef = collection(db, 'activityLogs');
    const q = query(
      logsRef,
      where('userId', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(maxCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Fetch user notifications (from the nested subcollection)
   */
  async getUserNotifications(uid) {
    const notifsRef = collection(db, 'users', uid, 'notifications');
    const q = query(notifsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(uid, notificationId) {
    const notifRef = doc(db, 'users', uid, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  },

  /**
   * Fetch members that can receive task assignments.
   */
  async getAssignableMembers() {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => ['Main CEO', 'Co-CEO', 'Leader', 'Member'].includes(user.role))
      .sort((a, b) => (a.displayName || a.username || '').localeCompare(b.displayName || b.username || ''));
  },

  /**
   * Fetch all members for portfolio showcase
   */
  async getAllMembers() {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.username) // Only include users with usernames
      .sort((a, b) => (b.xp || 0) - (a.xp || 0)); // Sort by XP descending
  }
};
