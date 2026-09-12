import { db } from '@services/firebase/config';
import { errorHandler } from '@shared/utils/errorHandler';
import { NotificationsService } from '@services/firestore/notifications';
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

/**
 * Fire a system notification to all members about a new public memobook.
 */
async function notifyPublicMemobook({ memobookId, title, authorName, authorUid }) {
  try {
    await NotificationsService.createNotification({
      title: '📓 New Public Memobook',
      message: `${authorName} just shared a public memobook: "${title}". Open it to read or collaborate!`,
      type: 'member_action',
      category: 'public',
      actorName: authorName,
      actorUid: authorUid,
      link: '/memobook',
      isPublic: true,
      isPrivate: false,
    });
  } catch (err) {
    // Non-critical — swallow silently
    console.warn('[Memobook] Failed to send public notification:', err);
  }
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
      bgColor: data.bgColor || '#ffffff',
      textColor: data.textColor || '#000000',
      visibility: data.visibility || 'private',       // 'private' | 'public'
      allowCollabEdit: data.allowCollabEdit ?? false, // only relevant when public
      createdBy: userId,
      createdByName: data.createdByName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!memobook.title) {
      throw new Error('Title is required.');
    }

    try {
      const docRef = await addDoc(collection(db, 'memobooks'), memobook);

      // Notify all members if this memobook is public
      if (memobook.visibility === 'public') {
        await notifyPublicMemobook({
          memobookId: docRef.id,
          title: memobook.title,
          authorName: memobook.createdByName || 'A member',
          authorUid: userId,
        });
      }

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
  async updateMemobook(memobookId, data, { notifyIfPublic = false, authorName = 'A member', authorUid = null, title = '' } = {}) {
    try {
      const docRef = doc(db, 'memobooks', memobookId);
      const updates = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updates);

      // If owner just flipped this memobook to public, notify all members
      if (notifyIfPublic && data.visibility === 'public') {
        await notifyPublicMemobook({ memobookId, title, authorName, authorUid });
      }

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
   * Subscribe to the current user's own memobooks (all, incl. private)
   */
  subscribeToMemobooks(userId, callback) {
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
      if (err.message.includes('index') || err.code === 'failed-precondition') {
        console.log('Index not ready, using fallback query for memobooks');
        unsubscribe = onSnapshot(qWithoutOrder, (snap) => {
          const memobooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  /**
   * Subscribe to all public memobooks (for the shared feed tab)
   */
  subscribeToPublicMemobooks(callback) {
    const q = query(
      collection(db, 'memobooks'),
      where('visibility', '==', 'public'),
      orderBy('updatedAt', 'desc')
    );

    const qFallback = query(
      collection(db, 'memobooks'),
      where('visibility', '==', 'public')
    );

    let unsubscribe = onSnapshot(q, (snap) => {
      const memobooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(memobooks);
    }, (err) => {
      if (err.message.includes('index') || err.code === 'failed-precondition') {
        unsubscribe = onSnapshot(qFallback, (snap) => {
          const memobooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          memobooks.sort((a, b) => {
            const aTime = a.updatedAt?.toMillis?.() || 0;
            const bTime = b.updatedAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
          callback(memobooks);
        }, (fallbackErr) => {
          errorHandler.error(fallbackErr, 'Subscribe to Public Memobooks (fallback)', {});
        });
      } else {
        errorHandler.error(err, 'Subscribe to Public Memobooks', {});
      }
    });

    return () => unsubscribe();
  },
};