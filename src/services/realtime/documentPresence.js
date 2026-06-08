import { rtdb } from '../firebase/config';
import { ref, onValue, onDisconnect, set, remove, serverTimestamp } from 'firebase/database';

export const DocumentPresenceService = {
  // Join a document session
  joinDocument(docId, userProfile) {
    if (!docId || !userProfile?.uid) return () => {};
    
    const presenceRef = ref(rtdb, `documentPresence/${docId}/users/${userProfile.uid}`);
    
    // Set initial presence
    set(presenceRef, {
      ...userProfile,
      cursor: null,
      joinedAt: serverTimestamp()
    });
    
    // Automatically remove when disconnected
    onDisconnect(presenceRef).remove();
    
    return () => {
      remove(presenceRef);
    };
  },

  // Listen for all users currently editing the document
  subscribeToDocPresence(docId, callback) {
    if (!docId) return () => {};
    const docPresenceRef = ref(rtdb, `documentPresence/${docId}/users`);
    
    return onValue(docPresenceRef, (snap) => {
      callback(snap.val() || {});
    });
  },

  // Update cursor position (x, y) or text index
  updateCursor(docId, uid, cursorData) {
    if (!docId || !uid) return;
    const cursorRef = ref(rtdb, `documentPresence/${docId}/users/${uid}/cursor`);
    // Overwrite the cursor data
    set(cursorRef, cursorData);
  }
};
