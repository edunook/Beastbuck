import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const AIChatHistoryService = {
  getSessions: async (uid) => {
    if (!uid) return [];
    const snap = await getDocs(query(collection(db, 'aiChatSessions'), where('userId', '==', uid)));
    const docs = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    return docs.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  },

  getSessionMessages: async (sessionId) => {
    if (!sessionId) return [];
    const snap = await getDocs(query(collection(db, `aiChatSessions/${sessionId}/messages`)));
    const docs = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    return docs.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });
  },

  createSession: async (uid, title = 'New Conversation') => {
    if (!uid) return null;
    const docRef = await addDoc(collection(db, 'aiChatSessions'), {
      userId: uid,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  addMessageToSession: async (sessionId, role, content) => {
    if (!sessionId) return null;
    await addDoc(collection(db, `aiChatSessions/${sessionId}/messages`), {
      role,
      content,
      createdAt: serverTimestamp(),
    });
    // Update the session's updatedAt timestamp
    await updateDoc(doc(db, 'aiChatSessions', sessionId), {
      updatedAt: serverTimestamp()
    });
  },

  deleteSession: async (sessionId) => {
    if (!sessionId) return;
    
    // In a real app we'd delete the subcollection messages too, or use a cloud function.
    // For now we just delete the parent session doc so it disappears from the UI.
    await deleteDoc(doc(db, 'aiChatSessions', sessionId));
  }
};
