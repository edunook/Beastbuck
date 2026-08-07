import { db, rtdb } from '@services/firebase/config';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { ref, onValue, set, remove, onDisconnect } from 'firebase/database';

export const WhiteboardSyncService = {
  // ELEMENTS SYNC (FIRESTORE)
  subscribeToElements(boardId, callback) {
    if (!boardId) return () => {};
    const elementsRef = collection(db, `whiteboards/${boardId}/elements`);
    
    return onSnapshot(query(elementsRef), (snap) => {
      const elements = {};
      snap.docs.forEach(doc => {
        elements[doc.id] = { id: doc.id, ...doc.data() };
      });
      callback(elements);
    });
  },

  async addElement(boardId, elementData) {
    if (!boardId) return;
    const elementsRef = collection(db, `whiteboards/${boardId}/elements`);
    const docRef = doc(elementsRef); // auto ID
    await setDoc(docRef, { ...elementData, updatedAt: serverTimestamp() });
    return docRef.id;
  },

  async updateElement(boardId, elementId, updates) {
    if (!boardId || !elementId) return;
    const elementRef = doc(db, `whiteboards/${boardId}/elements/${elementId}`);
    await setDoc(elementRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  },

  async removeElement(boardId, elementId) {
    if (!boardId || !elementId) return;
    const elementRef = doc(db, `whiteboards/${boardId}/elements/${elementId}`);
    await deleteDoc(elementRef);
  },

  // SNAPSHOTS
  async createSnapshot(boardId, elements, createdBy) {
    const snapshotsRef = collection(db, `whiteboardSnapshots`);
    await addDoc(snapshotsRef, {
      boardId,
      elements, // JSON stringified or raw map
      createdBy,
      createdAt: serverTimestamp()
    });
  },

  // CURSOR & PRESENCE SYNC (RTDB)
  joinWhiteboard(boardId, userProfile) {
    if (!boardId || !userProfile?.uid) return () => {};
    
    const presenceRef = ref(rtdb, `whiteboardPresence/${boardId}/users/${userProfile.uid}`);
    set(presenceRef, {
      ...userProfile,
      cursor: null,
      joinedAt: Date.now()
    });
    
    onDisconnect(presenceRef).remove();
    return () => remove(presenceRef);
  },

  subscribeToPresence(boardId, callback) {
    if (!boardId) return () => {};
    const presenceRef = ref(rtdb, `whiteboardPresence/${boardId}/users`);
    return onValue(presenceRef, (snap) => {
      callback(snap.val() || {});
    });
  },

  updateCursor(boardId, uid, x, y) {
    if (!boardId || !uid) return;
    const cursorRef = ref(rtdb, `whiteboardPresence/${boardId}/users/${uid}/cursor`);
    set(cursorRef, { x, y });
  }
};
