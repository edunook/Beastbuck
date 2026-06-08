import { db } from '../firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';

const CURSOR_THROTTLE_MS = 80;
const lastCursorWrite = {};

export const LiveCollabService = {
  subscribeToDocumentPresence(documentId, { onPresence }) {
    const q = query(collection(db, 'documentPresence'), where('documentId', '==', documentId));
    return onSnapshot(q, (snap) => {
      const editors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onPresence(editors);
    });
  },

  async setDocumentPresence({ documentId, workspaceId, userId, displayName, isTyping = false }) {
    const id = `${documentId}_${userId}`;
    await setDoc(doc(db, 'documentPresence', id), {
      documentId,
      workspaceId,
      userId,
      displayName,
      isTyping,
      lastSeen: serverTimestamp(),
    });
  },

  async clearDocumentPresence(documentId, userId) {
    await deleteDoc(doc(db, 'documentPresence', `${documentId}_${userId}`)).catch(() => {});
  },

  subscribeToSharedCursors(sessionId, { onCursors }) {
    const q = query(collection(db, 'sharedCursors'), where('sessionId', '==', sessionId));
    return onSnapshot(q, (snap) => {
      onCursors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async updateSharedCursor({ sessionId, userId, displayName, x, y, color }) {
    const now = Date.now();
    const key = `${sessionId}_${userId}`;
    if (now - (lastCursorWrite[key] || 0) < CURSOR_THROTTLE_MS) return;
    lastCursorWrite[key] = now;

    await setDoc(doc(db, 'sharedCursors', key), {
      sessionId,
      userId,
      displayName,
      x,
      y,
      color: color || '#00f0ff',
      updatedAt: serverTimestamp(),
    });
  },

  async clearSharedCursor(sessionId, userId) {
    await deleteDoc(doc(db, 'sharedCursors', `${sessionId}_${userId}`)).catch(() => {});
  },

  subscribeToWhiteboardElements(whiteboardId, { onElements }) {
    const q = query(collection(db, 'whiteboardElements'), where('whiteboardId', '==', whiteboardId));
    return onSnapshot(q, (snap) => {
      onElements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async upsertWhiteboardElement(whiteboardId, elementId, data, userId) {
    await setDoc(doc(db, 'whiteboardElements', elementId), {
      whiteboardId,
      ...data,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  subscribeToLiveComments(targetType, targetId, { onComments }) {
    const q = query(
      collection(db, 'liveComments'),
      where('targetType', '==', targetType),
      where('targetId', '==', targetId)
    );
    return onSnapshot(q, (snap) => {
      onComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async addLiveComment({ targetType, targetId, text, authorId, authorName }) {
    const id = `${targetType}_${targetId}_${Date.now()}`;
    await setDoc(doc(db, 'liveComments', id), {
      targetType,
      targetId,
      text,
      authorId,
      authorName,
      createdAt: serverTimestamp(),
    });
  },

  subscribeToWorkspacePresence(workspaceId, { onMembers }) {
    const q = query(collection(db, 'workspacePresence'), where('workspaceId', '==', workspaceId));
    return onSnapshot(q, (snap) => {
      onMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async setWorkspacePresence({ workspaceId, userId, displayName, activity }) {
    await setDoc(doc(db, 'workspacePresence', `${workspaceId}_${userId}`), {
      workspaceId,
      userId,
      displayName,
      activity: activity || 'viewing',
      lastSeen: serverTimestamp(),
    });
  },

  subscribeToMindMapNodes(mapId, { onNodes }) {
    const q = query(collection(db, 'mindMaps', mapId, 'liveNodes'));
    return onSnapshot(q, (snap) => onNodes(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => onNodes([]));
  },

  async upsertMindMapNode(mapId, nodeId, data, userId) {
    await setDoc(doc(db, 'mindMaps', mapId, 'liveNodes', nodeId), {
      ...data,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
};
