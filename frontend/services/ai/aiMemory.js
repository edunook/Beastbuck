import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export const AIMemoryService = {
  getMemory: async (uid) => {
    if (!uid) return null;
    const docRef = doc(db, 'aiMemory', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return {
        enabled: true,
        data: {},
        preferences: {},
        learningStyle: '',
        goals: [],
        interests: [],
        favoriteTopics: [],
        currentFocus: [],
      };
    }
    return snap.data();
  },

  updateStructuredMemory: async (uid, { preferences, learningStyle, goals, interests, favoriteTopics, currentFocus }) => {
    if (!uid) return;
    const docRef = doc(db, 'aiMemory', uid);
    const snap = await getDoc(docRef);
    const payload = {
      ...(preferences !== undefined && { preferences }),
      ...(learningStyle !== undefined && { learningStyle }),
      ...(goals !== undefined && { goals }),
      ...(interests !== undefined && { interests }),
      ...(favoriteTopics !== undefined && { favoriteTopics }),
      ...(currentFocus !== undefined && { currentFocus }),
      updatedAt: new Date().toISOString(),
    };
    if (!snap.exists()) {
      await setDoc(docRef, { enabled: true, data: {}, ...payload });
    } else {
      await updateDoc(docRef, payload);
    }
  },

  updateMemory: async (uid, updates) => {
    if (!uid) return;
    const docRef = doc(db, 'aiMemory', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { enabled: true, data: updates });
    } else {
      const current = snap.data();
      if (current.enabled === false && updates.enabled === undefined) return; // respect disabled state
      await updateDoc(docRef, {
        ...updates,
        data: { ...(current.data || {}), ...(updates.data || {}) }
      });
    }
  },
  
  clearMemory: async (uid) => {
    if (!uid) return;
    const docRef = doc(db, 'aiMemory', uid);
    await setDoc(docRef, { enabled: true, data: {} });
  },

  setMemoryEnabled: async (uid, enabled) => {
    if (!uid) return;
    const docRef = doc(db, 'aiMemory', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { enabled, data: {} });
    } else {
      await updateDoc(docRef, { enabled });
    }
  }
};
