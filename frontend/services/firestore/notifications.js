import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const LOCAL_READ_STORAGE_KEY = 'beastbuck_read_notifications_v2';
const LOCAL_DELETED_STORAGE_KEY = 'beastbuck_deleted_notifications_v2';

function getLocalReadIds() {
  try {
    const raw = localStorage.getItem(LOCAL_READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function getLocalDeletedIds() {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalReadId(id) {
  try {
    const existing = getLocalReadIds();
    if (!existing.includes(id)) {
      localStorage.setItem(LOCAL_READ_STORAGE_KEY, JSON.stringify([...existing, id]));
    }
  } catch (err) {
    console.error('Failed saving local read status:', err);
  }
}

function saveLocalReadIds(ids) {
  try {
    const existing = new Set(getLocalReadIds());
    ids.forEach(id => existing.add(id));
    localStorage.setItem(LOCAL_READ_STORAGE_KEY, JSON.stringify(Array.from(existing)));
  } catch (err) {
    console.error('Failed saving local read statuses:', err);
  }
}

function saveLocalDeletedId(id) {
  try {
    const existing = getLocalDeletedIds();
    if (!existing.includes(id)) {
      localStorage.setItem(LOCAL_DELETED_STORAGE_KEY, JSON.stringify([...existing, id]));
    }
  } catch (err) {
    console.error('Failed saving local deleted status:', err);
  }
}

export const NotificationsService = {
  /**
   * Subscribe to real-time notifications directly from Firestore.
   * Merges system_notifications and users/{uid}/notifications with zero mock/fake data.
   */
  subscribeToNotifications(uid, { onNotifications, onError, notificationLimit = 50 }) {
    const combinedMap = new Map();
    const unsubscribers = [];

    const publishCombined = () => {
      const readIds = getLocalReadIds();
      const deletedIds = getLocalDeletedIds();

      const items = Array.from(combinedMap.values())
        .filter(item => !deletedIds.includes(item.id))
        .filter(item => !item.isPrivate || item.uid === uid || item.recipientUid === uid)
        .map(item => ({
          ...item,
          read: Boolean(item.read || readIds.includes(item.id)),
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

      onNotifications(items);
    };

    // 1. Listen to real Firestore system_notifications collection (public & system events)
    try {
      const sysRef = collection(db, 'system_notifications');
      const sysQuery = query(sysRef, orderBy('createdAt', 'desc'), limit(notificationLimit));
      const sysUnsub = onSnapshot(
        sysQuery,
        (snap) => {
          snap.docs.forEach(docSnap => {
            combinedMap.set(docSnap.id, {
              id: docSnap.id,
              ...docSnap.data(),
            });
          });
          publishCombined();
        },
        (err) => {
          if (err?.code !== 'permission-denied') {
            console.warn('System notifications stream fallback:', err);
          }
          publishCombined();
        }
      );
      unsubscribers.push(sysUnsub);
    } catch (err) {
      console.warn('Could not connect to system_notifications collection:', err);
    }

    // 2. Listen to real Firestore users/{uid}/notifications if user logged in
    if (uid) {
      try {
        const userNotifsRef = collection(db, 'users', uid, 'notifications');
        const userQuery = query(userNotifsRef, orderBy('createdAt', 'desc'), limit(notificationLimit));
        const userUnsub = onSnapshot(
          userQuery,
          (snap) => {
            snap.docs.forEach(docSnap => {
              combinedMap.set(docSnap.id, {
                id: docSnap.id,
                ...docSnap.data(),
              });
            });
            publishCombined();
          },
          (err) => {
            if (err?.code !== 'permission-denied') {
              console.warn('User notifications stream fallback:', err);
            }
            publishCombined();
          }
        );
        unsubscribers.push(userUnsub);
      } catch (err) {
        console.warn('Could not connect to user notifications subcollection:', err);
      }
    } else {
      publishCombined();
    }

    return () => {
      unsubscribers.forEach(unsub => unsub?.());
    };
  },

  /**
   * Create a real notification record in Firestore.
   */
  async createNotification(notification) {
    const payload = {
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'update',
      category: notification.category || (notification.isPublic ? 'public' : 'team'),
      actorName: notification.actorName || 'BeastBuck Member',
      actorAvatar: notification.actorAvatar || null,
      link: notification.link || '/dashboard',
      isPublic: Boolean(notification.isPublic),
      isPrivate: Boolean(notification.isPrivate),
      recipientUid: notification.recipientUid || null,
      read: false,
      createdAt: serverTimestamp(),
    };

    try {
      if (notification.targetUid) {
        const ref = collection(db, 'users', notification.targetUid, 'notifications');
        return await addDoc(ref, payload);
      } else {
        const ref = collection(db, 'system_notifications');
        return await addDoc(ref, payload);
      }
    } catch (err) {
      console.error('Failed creating Firestore notification:', err);
      throw err;
    }
  },

  async markAsRead(uid, notificationId) {
    saveLocalReadId(notificationId);

    try {
      if (uid) {
        const userNotifRef = doc(db, 'users', uid, 'notifications', notificationId);
        await updateDoc(userNotifRef, { read: true }).catch(() => {});
      }
      const sysNotifRef = doc(db, 'system_notifications', notificationId);
      await updateDoc(sysNotifRef, { read: true }).catch(() => {});
    } catch (err) {
      // Ignored if document permission prevents update
    }
  },

  async markAllAsRead(uid, notifications = []) {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    saveLocalReadIds(unreadIds);

    try {
      const batch = writeBatch(db);
      let count = 0;

      unreadIds.forEach(id => {
        if (uid) {
          const uRef = doc(db, 'users', uid, 'notifications', id);
          batch.update(uRef, { read: true });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit().catch(() => {});
      }
    } catch (err) {
      console.warn('Batch mark read failed:', err);
    }
  },

  async deleteNotification(uid, notificationId) {
    saveLocalDeletedId(notificationId);

    try {
      if (uid) {
        const uRef = doc(db, 'users', uid, 'notifications', notificationId);
        await deleteDoc(uRef).catch(() => {});
      }
      const sysRef = doc(db, 'system_notifications', notificationId);
      await deleteDoc(sysRef).catch(() => {});
    } catch (err) {
      // Ignored
    }
  },
};
