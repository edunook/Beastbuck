import { db } from '@services/firebase/config';
import {
  arrayUnion,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  setDoc,
  limit,
} from 'firebase/firestore';
import { ActivityService } from './activity';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const VOICE_ROOM_TYPES = ['GLOBAL', 'DEPARTMENT', 'LAB', 'PROJECT', 'TEMPORARY', 'PRIVATE', 'global'];
export const MEETING_TYPES = ['team', 'research', 'innovation', 'community', 'general'];

export const CollaborationService = {
  async createVoiceRoom({ name, title, type, createdBy, createdByName, description = '', scopeId, isPrivate = false }) {
    const roomName = name || title || 'Voice Room';
    const roomData = {
      name: roomName,
      title: roomName,
      type: type || 'GLOBAL',
      description,
      createdBy,
      createdByName,
      scopeId: scopeId || null,
      participantCount: 0,
      participants: [],
      moderators: [createdBy],
      active: true,
      archived: false,
      isPrivate,
      pushToTalk: false,
      noiseSuppression: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'voiceRooms'), roomData);
    return docRef.id;
  },

  async getVoiceRooms(type = null) {
    try {
      let q = query(collection(db, 'voiceRooms'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(50));
      if (type) q = query(collection(db, 'voiceRooms'), where('type', '==', type), where('active', '==', true), limit(50));
      const snap = await getDocs(q);
      return docsFrom(snap);
    } catch {
      const snap = await getDocs(query(collection(db, 'voiceRooms'), limit(50)));
      return docsFrom(snap).filter(r => r.active !== false && !r.archived);
    }
  },

  subscribeToVoiceRooms({ onRooms, type }) {
    let q = query(collection(db, 'voiceRooms'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(50));
    if (type) q = query(collection(db, 'voiceRooms'), where('type', '==', type), limit(50));
    return onSnapshot(q, (snap) => onRooms(docsFrom(snap)), () => onRooms([]));
  },

  subscribeToVoiceRoom(roomId, { onRoom }) {
    return onSnapshot(doc(db, 'voiceRooms', roomId), (snap) => {
      onRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async joinVoiceRoom(roomId, userId, profile = {}) {
    const participant = {
      uid: userId,
      name: profile.displayName || profile.username || profile.createdByName || 'Member',
      muted: true,
      speaking: false,
      joinedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'voiceRooms', roomId), {
      participants: arrayUnion(participant),
    });
    await setDoc(doc(db, 'roomPermissions', `${roomId}_${userId}`), {
      roomId,
      roomType: 'voice',
      userId,
      role: 'participant',
      joinedAt: serverTimestamp(),
    }, { merge: true });
  },

  async leaveVoiceRoom(roomId, userId) {
    const snap = await getDoc(doc(db, 'voiceRooms', roomId));
    if (!snap.exists()) return;
    const participants = (snap.data().participants || []).filter(p => p.uid !== userId);
    await updateDoc(doc(db, 'voiceRooms', roomId), { participants, participantCount: participants.length });
  },

  async setVoiceMute(roomId, userId, muted) {
    const snap = await getDoc(doc(db, 'voiceRooms', roomId));
    if (!snap.exists()) return;
    const participants = (snap.data().participants || []).map(p =>
      p.uid === userId ? { ...p, muted } : p
    );
    await updateDoc(doc(db, 'voiceRooms', roomId), { participants });
  },

  async createVideoRoom({ title, template, createdBy, createdByName, scheduledFor = null }) {
    const roomData = {
      title,
      template, // Quick Meeting, Research Review, Innovation Review, Department Meeting, Board Meeting, Event Meeting
      createdBy,
      createdByName,
      scheduledFor,
      active: true,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'videoRooms'), roomData);
    return docRef.id;
  },

  async getActiveMeetings() {
    const q = query(
      collection(db, 'videoRooms'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async endVideoRoom(roomId) {
    const roomRef = doc(db, 'videoRooms', roomId);
    await updateDoc(roomRef, { active: false, status: 'ended', endedAt: serverTimestamp() });
  },

  // ---------------------------------------------------------------------------
  // MEETINGS & WAR ROOMS
  // ---------------------------------------------------------------------------
  async createMeeting({ title, type, hostId, hostName, scheduledAt, waitingRoom = true }) {
    const meetingRef = await addDoc(collection(db, 'meetingRooms'), {
      title,
      type: type || 'team',
      hostId,
      hostName,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? 'scheduled' : 'live',
      waitingRoom,
      participants: [],
      handRaises: [],
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'videoRooms'), {
      meetingId: meetingRef.id,
      title,
      hostId,
      active: true,
      createdAt: serverTimestamp(),
    });
    return meetingRef.id;
  },

  subscribeToMeetings({ onMeetings }) {
    const q = query(collection(db, 'meetingRooms'), orderBy('createdAt', 'desc'), limit(40));
    return onSnapshot(q, (snap) => onMeetings(docsFrom(snap)), () => onMeetings([]));
  },

  subscribeToMeeting(meetingId, { onMeeting }) {
    return onSnapshot(doc(db, 'meetingRooms', meetingId), (snap) => {
      onMeeting(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async joinMeeting(meetingId, userId, profile = {}) {
    await updateDoc(doc(db, 'meetingRooms', meetingId), {
      participants: arrayUnion({
        uid: userId,
        name: profile.displayName || profile.username || 'Member',
        joinedAt: new Date().toISOString(),
      }),
    });
    await addDoc(collection(db, 'liveSessions'), {
      sessionType: 'meeting',
      sessionId: meetingId,
      userId,
      joinedAt: serverTimestamp(),
    });
  },

  async leaveMeeting(meetingId, userId) {
    const snap = await getDoc(doc(db, 'meetingRooms', meetingId));
    if (!snap.exists()) return;
    const participants = (snap.data().participants || []).filter(p => p.uid !== userId);
    await updateDoc(doc(db, 'meetingRooms', meetingId), { participants });
  },

  async saveMeetingNotes(meetingId, { content, authorId }) {
    return addDoc(collection(db, 'meetingNotes'), {
      meetingId,
      content,
      authorId,
      createdAt: serverTimestamp(),
    });
  },

  generateMeetingInsights(notes) {
    const lines = String(notes || '').split('\n').filter(Boolean);
    return {
      summary: lines.slice(0, 4).join(' ') || 'Meeting completed.',
      actionItems: lines.filter(l => /^(todo|action|task)/i.test(l)).slice(0, 6),
      decisions: lines.filter(l => /^decision/i.test(l)).slice(0, 4),
    };
  },

  async createWarRoom({ title, projectId, createdBy, description = '' }) {
    const ref = await addDoc(collection(db, 'teamWarRooms'), {
      title,
      description,
      projectId: projectId || null,
      createdBy,
      members: [createdBy],
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getWarRooms(userId) {
    try {
      const snap = await getDocs(
        query(collection(db, 'teamWarRooms'), where('members', 'array-contains', userId), limit(30))
      );
      return docsFrom(snap);
    } catch {
      const snap = await getDocs(query(collection(db, 'teamWarRooms'), orderBy('createdAt', 'desc'), limit(30)));
      return docsFrom(snap);
    }
  },

  subscribeToWarRoom(roomId, { onRoom }) {
    return onSnapshot(doc(db, 'teamWarRooms', roomId), (snap) => {
      onRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async createBrainstormSession({ title, warRoomId, createdBy, anonymous = false }) {
    const ref = await addDoc(collection(db, 'brainstormSessions'), {
      title,
      warRoomId: warRoomId || null,
      createdBy,
      anonymous,
      ideas: [],
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  subscribeToBrainstorm(sessionId, { onSession }) {
    return onSnapshot(doc(db, 'brainstormSessions', sessionId), (snap) => {
      onSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async addBrainstormIdea(sessionId, { text, authorId, authorName, anonymous }) {
    const idea = {
      id: `idea_${Date.now()}`,
      text,
      authorId: anonymous ? null : authorId,
      authorName: anonymous ? 'Anonymous' : authorName,
      votes: 0,
      voters: [],
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'brainstormSessions', sessionId), { ideas: arrayUnion(idea) });
  },

  async voteBrainstormIdea(sessionId, ideaId, userId) {
    const snap = await getDoc(doc(db, 'brainstormSessions', sessionId));
    if (!snap.exists()) return;
    const ideas = (snap.data().ideas || []).map(idea => {
      if (idea.id !== ideaId) return idea;
      const voted = idea.voters?.includes(userId);
      return {
        ...idea,
        votes: voted ? Math.max(0, idea.votes - 1) : idea.votes + 1,
        voters: voted ? (idea.voters || []).filter(v => v !== userId) : [...(idea.voters || []), userId],
      };
    });
    await updateDoc(doc(db, 'brainstormSessions', sessionId), { ideas });
  },

  subscribeToActivityStream({ onItems, limitCount = 50 }) {
    const q = query(collection(db, 'activityPresence'), orderBy('timestamp', 'desc'), limit(limitCount));
    return onSnapshot(
      q,
      (snap) => onItems(docsFrom(snap)),
      async () => {
        const fallback = await ActivityService.getRecentActivity(limitCount);
        onItems(
          fallback.map(log => ({
            id: log.id,
            type: log.type,
            title: log.title,
            message: log.description,
            userId: log.userId,
            timestamp: log.timestamp,
            category: log.metadata?.category || 'Activity',
          }))
        );
      }
    );
  },

  async getCollaborationAnalytics() {
    const [voice, meetings, sessions, presenceSnap, warRooms] = await Promise.all([
      getDocs(collection(db, 'voiceRooms')),
      getDocs(collection(db, 'meetingRooms')),
      getDocs(query(collection(db, 'liveSessions'), limit(500))),
      getDocs(query(collection(db, 'presence'), limit(500))),
      getDocs(collection(db, 'teamWarRooms')),
    ]);
    const presence = docsFrom(presenceSnap);
    const activeVoice = docsFrom(voice).filter(r => (r.participants || []).length > 0 || r.participantCount > 0).length;
    return {
      activeSessions: sessions.size,
      chatMessages24h: 0,
      activeWarRooms: warRooms.size,
      crossDeptLinks: 0,
      activeVoiceRooms: activeVoice,
      totalMeetings: meetings.size,
      onlineMembers: presence.filter(p => p.state === 'online' || p.state === 'collaborating').length,
      meetingHoursEstimate: Math.round(sessions.size * 0.5),
    };
  },
};
