import { db } from '@services/firebase/config';
import { errorHandler } from '@shared/utils/errorHandler';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

function clean(value) {
  return String(value || '').trim();
}

export const MemobookService = {
  /**
   * Create a new memobook
   */
  async createMemobook(userId, data) {
    const memobook = {
      title: clean(data.title),
      description: clean(data.description || ''),
      content: clean(data.content || ''),
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!memobook.title) {
      throw new Error('Title is required.');
    }

    try {
      const docRef = await addDoc(collection(db, 'memobooks'), memobook);
      return docRef.id;
    } catch (err) {
      errorHandler.error(err, 'Create Memobook', { userId });
      throw err;
    }
  },

  /**
   * Get all memobooks for a user
   */
  async getMemobooks(userId) {
    try {
      const q = query(
        collection(db, 'memobooks'),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      errorHandler.error(err, 'Get Memobooks', { userId });
      throw err;
    }
  },

  /**
   * Get a specific memobook
   */
  async getMemobook(memobookId) {
    try {
      const docRef = doc(db, 'memobooks', memobookId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      errorHandler.error(err, 'Get Memobook', { memobookId });
      throw err;
    }
  },

  /**
   * Update a memobook
   */
  async updateMemobook(memobookId, data) {
    try {
      const docRef = doc(db, 'memobooks', memobookId);
      const updates = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updates);
      return true;
    } catch (err) {
      errorHandler.error(err, 'Update Memobook', { memobookId });
      throw err;
    }
  },

  /**
   * Delete a memobook
   */
  async deleteMemobook(memobookId) {
    try {
      await deleteDoc(doc(db, 'memobooks', memobookId));
      return true;
    } catch (err) {
      errorHandler.error(err, 'Delete Memobook', { memobookId });
      throw err;
    }
  },

  /**
   * Subscribe to memobooks updates
   */
  subscribeToMemobooks(userId, callback) {
    // Try with orderBy first (requires index), fall back to without orderBy if index not ready
    const qWithOrder = query(
      collection(db, 'memobooks'),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const qWithoutOrder = query(
      collection(db, 'memobooks'),
      where('createdBy', '==', userId)
    );

    let unsubscribe = onSnapshot(qWithOrder, (snap) => {
      const memobooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(memobooks);
    }, (err) => {
      // If index error, fall back to query without orderBy
      if (err.message.includes('index') || err.code === 'failed-precondition') {
        console.log('Index not ready, using fallback query for memobooks');
        unsubscribe = onSnapshot(qWithoutOrder, (snap) => {
          const memobooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort client-side by updatedAt
          memobooks.sort((a, b) => {
            const aTime = a.updatedAt?.toMillis?.() || 0;
            const bTime = b.updatedAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
          callback(memobooks);
        }, (fallbackErr) => {
          errorHandler.error(fallbackErr, 'Subscribe to Memobooks (fallback)', { userId });
        });
      } else {
        errorHandler.error(err, 'Subscribe to Memobooks', { userId });
      }
    });

    return () => unsubscribe();
  },
};