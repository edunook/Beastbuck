import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const EventService = {
  // ---------------------------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------------------------
  async getEvents({ status, limitCount = 50 } = {}) {
    let q = query(collection(db, 'events'), orderBy('startDate', 'asc'), limit(limitCount));
    
    // We can filter by status or rely on client-side filtering
    if (status) {
      q = query(collection(db, 'events'), where('status', '==', status), orderBy('startDate', 'asc'), limit(limitCount));
    }
    
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getEvent(eventId) {
    if (!eventId) return null;
    const snap = await getDoc(doc(db, 'events', eventId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async createEvent(eventData, actorId) {
    const newDoc = doc(collection(db, 'events'));
    await setDoc(newDoc, {
      ...eventData,
      createdBy: actorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc.id;
  },

  async updateEvent(eventId, eventData, actorId) {
    await updateDoc(doc(db, 'events', eventId), {
      ...eventData,
      updatedBy: actorId,
      updatedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // EVENT PARTICIPANTS
  // ---------------------------------------------------------------------------
  async joinEvent(eventId, userId) {
    // Generate a predictable ID so a user can only register once
    const participantId = `${eventId}_${userId}`;
    await setDoc(doc(db, 'eventParticipants', participantId), {
      eventId,
      userId,
      joinedAt: serverTimestamp(),
      status: 'REGISTERED',
    });
  },

  async leaveEvent(eventId, userId) {
    const participantId = `${eventId}_${userId}`;
    await deleteDoc(doc(db, 'eventParticipants', participantId));
  },

  async getEventParticipants(eventId) {
    const snap = await getDocs(
      query(collection(db, 'eventParticipants'), where('eventId', '==', eventId))
    );
    const participants = docsFrom(snap);
    
    if (participants.length === 0) return [];

    // Fetch user details
    const userIds = participants.map(p => p.userId);
    const users = [];
    for (let i = 0; i < userIds.length; i += 10) {
      const chunk = userIds.slice(i, i + 10);
      const userSnap = await getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)));
      users.push(...docsFrom(userSnap));
    }

    return participants.map(p => {
      const u = users.find(user => user.id === p.userId) || { displayName: 'Unknown', username: 'unknown' };
      return { ...p, user: u };
    });
  },
  
  async hasJoinedEvent(eventId, userId) {
    if (!userId) return false;
    const participantId = `${eventId}_${userId}`;
    const snap = await getDoc(doc(db, 'eventParticipants', participantId));
    return snap.exists();
  },

  async getUpcomingEvents(limitCount = 5) {
    const now = new Date();
    const q = query(
      collection(db, 'events'), 
      where('startDate', '>=', now), 
      orderBy('startDate', 'asc'), 
      limit(limitCount)
    );
    
    const snap = await getDocs(q);
    return docsFrom(snap);
  }
};
