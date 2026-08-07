import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

export const NotificationsService = {
  subscribeToNotifications(uid, { onNotifications, onError, notificationLimit = 10 }) {
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(notificationLimit),
    );

    return onSnapshot(
      q,
      (snap) => {
        onNotifications(snap.docs.map(notificationDoc => ({
          id: notificationDoc.id,
          ...notificationDoc.data(),
        })));
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  async markAsRead(uid, notificationId) {
    const notificationRef = doc(db, 'users', uid, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  },
};
