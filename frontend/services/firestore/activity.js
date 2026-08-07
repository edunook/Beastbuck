import { db } from '@services/firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export const ActivityService = {
  /**
   * Log a new activity event
   */
  async logActivity({ type, title, description, userId, metadata = {} }) {
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      type,
      title,
      description,
      userId,
      metadata,
      timestamp: serverTimestamp()
    });
  },

  /**
   * Fetch recent activity for feeds
   */
  async getRecentActivity(maxCount = 20) {
    const logsRef = collection(db, 'activityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
