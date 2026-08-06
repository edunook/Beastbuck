import { db } from '../firebase/config';
import { errorHandler } from '../../utils/errorHandler';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ActivityService } from '../firebase/activity';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const VOICE_ROOM_TYPES = ['global', 'department', 'lab', 'project', 'private', 'temporary'];
export const MEETING_TYPES = ['team', 'research', 'innovation', 'community', 'general'];

export const CollaborationService = {
  // ---------------------------------------------------------------------------
  // VOICE ROOMS
  // ---------------------------------------------------------------------------
  subscribeToVoiceRooms({ onRooms, type }) {
    let q = query(collection(db, 'voiceRooms'), where('archived', '==', false), orderBy('createdAt', 'desc'), limit(50));
    if (type) {
      q = query(collection(db, 'voiceRooms'), where('type', '==', type), limit(50));
    }
    return onSnapshot(q, (snap) => onRooms(docsFrom(snap)), (err) => {
      errorHandler.error(err, 'Voice Rooms Listener');
      onRooms([]);
    });
  },

  async createVoiceRoom({ title, type, scopeId, createdBy, isPrivate = false }) {
    const ref = await addDoc(collection(db, 'voiceRooms'), {
      title,
      type: type || 'global',
      scopeId: scopeId || null,
      createdBy,
      isPrivate,
      participants: [],
      moderators: [createdBy],
      pushToTalk: false,
      noiseSuppression: true,
      archived: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  subscribeToVoiceRoom(roomId, { onRoom }) {
    return onSnapshot(doc(db, 'voiceRooms', roomId), (snap) => {
      onRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async joinVoiceRoom(roomId, userId, profile = {}) {
    await updateDoc(doc(db, 'voiceRooms', roomId), {
      participants: arrayUnion({
        uid: userId,
        name: profile.displayName || profile.username || 'Member',
        muted: false,
        speaking: false,
        joinedAt: new Date().toISOString(),
      }),
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
    await updateDoc(doc(db, 'voiceRooms', roomId), { participants });
  },

  async setVoiceMute(roomId, userId, muted) {
    const snap = await getDoc(doc(db, 'voiceRooms', roomId));
    if (!snap.exists()) return;
    const participants = (snap.data().participants || []).map(p =>
      p.uid === userId ? { ...p, muted } : p
    );
    await updateDoc(doc(db, 'voiceRooms', roomId), { participants });
  },

  // ---------------------------------------------------------------------------
  // VIDEO / MEETING ROOMS
  // ---------------------------------------------------------------------------
  subscribeToVideoRooms({ onRooms }) {
    const q = query(collection(db, 'videoRooms'), where('status', '!=', 'ended'), limit(30));
    return onSnapshot(q, (snap) => onRooms(docsFrom(snap)), () => onRooms([]));
  },

  async createMeeting({
    title,
    type,
    hostId,
    hostName,
    scheduledAt,
    waitingRoom = true,
    recordingEnabled = false,
  }) {
    const meetingRef = await addDoc(collection(db, 'meetingRooms'), {
      title,
      type: type || 'team',
      hostId,
      hostName,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? 'scheduled' : 'live',
      waitingRoom,
      recordingEnabled,
      participants: [],
      handRaises: [],
      screenShare: null,
      chatEnabled: true,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'videoRooms'), {
      meetingId: meetingRef.id,
      title,
      hostId,
      status: 'live',
      createdAt: serverTimestamp(),
    });

    return meetingRef.id;
  },

  subscribeToMeeting(meetingId, { onMeeting }) {
    return onSnapshot(doc(db, 'meetingRooms', meetingId), (snap) => {
      onMeeting(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async joinMeeting(meetingId, userId, profile = {}) {
    const participant = {
      uid: userId,
      name: profile.displayName || profile.username || 'Member',
      camera: false,
      mic: false,
      handRaised: false,
      joinedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'meetingRooms', meetingId), {
      participants: arrayUnion(participant),
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

  async toggleHandRaise(meetingId, userId, raised) {
    await updateDoc(doc(db, 'meetingRooms', meetingId), {
      handRaises: raised ? arrayUnion(userId) : arrayRemove(userId),
    });
  },

  async setScreenShare(meetingId, shareData) {
    await updateDoc(doc(db, 'meetingRooms', meetingId), {
      screenShare: shareData,
    });
    if (shareData) {
      await addDoc(collection(db, 'screenShares'), {
        meetingId,
        ...shareData,
        startedAt: serverTimestamp(),
      });
    }
  },

  async saveMeetingNotes(meetingId, { content, authorId }) {
    const ref = await addDoc(collection(db, 'meetingNotes'), {
      meetingId,
      content,
      authorId,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getMeetingNotes(meetingId) {
    const snap = await getDocs(
      query(collection(db, 'meetingNotes'), where('meetingId', '==', meetingId), orderBy('createdAt', 'desc'))
    );
    return docsFrom(snap);
  },

  subscribeToMeetings({ onMeetings, status }) {
    let q = query(collection(db, 'meetingRooms'), orderBy('createdAt', 'desc'), limit(40));
    if (status) {
      q = query(collection(db, 'meetingRooms'), where('status', '==', status), limit(40));
    }
    return onSnapshot(q, (snap) => onMeetings(docsFrom(snap)), () => onMeetings([]));
  },

  // ---------------------------------------------------------------------------
  // TEAM WAR ROOMS
  // ---------------------------------------------------------------------------
  async createWarRoom({ title, projectId, createdBy, description = '' }) {
    const ref = await addDoc(collection(db, 'teamWarRooms'), {
      title,
      description,
      projectId,
      createdBy,
      chatRoomId: null,
      voiceRoomId: null,
      whiteboardId: null,
      taskIds: [],
      members: [createdBy],
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  subscribeToWarRoom(roomId, { onRoom }) {
    return onSnapshot(doc(db, 'teamWarRooms', roomId), (snap) => {
      onRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async getWarRooms(userId) {
    const snap = await getDocs(
      query(collection(db, 'teamWarRooms'), where('members', 'array-contains', userId), limit(20))
    );
    return docsFrom(snap);
  },

  // ---------------------------------------------------------------------------
  // BRAINSTORM SESSIONS
  // ---------------------------------------------------------------------------
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
      group: null,
      score: 0,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'brainstormSessions', sessionId), {
      ideas: arrayUnion(idea),
    });
    return idea.id;
  },

  async voteBrainstormIdea(sessionId, ideaId, userId) {
    const snap = await getDoc(doc(db, 'brainstormSessions', sessionId));
    if (!snap.exists()) return;
    const ideas = (snap.data().ideas || []).map(idea => {
      if (idea.id !== ideaId) return idea;
      const voted = idea.voters?.includes(userId);
      return {
        ...idea,
        votes: voted ? idea.votes - 1 : idea.votes + 1,
        voters: voted
          ? (idea.voters || []).filter(v => v !== userId)
          : [...(idea.voters || []), userId],
      };
    });
    await updateDoc(doc(db, 'brainstormSessions', sessionId), { ideas });
  },

  // ---------------------------------------------------------------------------
  // ACTIVITY STREAM
  // ---------------------------------------------------------------------------
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

  async logActivityPresence({ type, title, message, userId, category, link }) {
    await addDoc(collection(db, 'activityPresence'), {
      type,
      title,
      message,
      userId,
      category: category || 'Activity',
      link: link || null,
      timestamp: serverTimestamp(),
    });
    await ActivityService.logActivity({
      type,
      title,
      description: message,
      userId,
      metadata: { category, link },
    });
  },

  // ---------------------------------------------------------------------------
  // AI MEETING ASSISTANT
  // ---------------------------------------------------------------------------
  async saveMeetingAssistantSummary(meetingId, { summary, actionItems, decisions, createdBy }) {
    const ref = await addDoc(collection(db, 'meetingRecordings'), {
      meetingId,
      summary,
      actionItems: actionItems || [],
      decisions: decisions || [],
      aiGenerated: true,
      createdBy,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  generateMeetingInsights(notes, participants = []) {
    const lines = String(notes || '').split('\n').filter(Boolean);
    const actionItems = lines
      .filter(l => /^(todo|action|task|-\s*\[)/i.test(l))
      .map(l => l.replace(/^(todo|action|task):?\s*/i, '').trim())
      .slice(0, 8);
    const decisions = lines
      .filter(l => /^(decision|decided|agreed)/i.test(l))
      .slice(0, 5);
    return {
      summary: lines.slice(0, 5).join(' ') || 'Meeting completed with team collaboration.',
      actionItems: actionItems.length ? actionItems : ['Review meeting notes and assign follow-up tasks'],
      decisions,
      followUps: [
        'Schedule next sync',
        'Update project board',
        participants.length ? `Follow up with ${participants[0]?.name || 'team'}` : 'Share notes with team',
      ],
      researchSuggestions: ['Document findings in workspace', 'Link research to innovation registry'],
    };
  },

  // ---------------------------------------------------------------------------
  // COLLABORATION ANALYTICS
  // ---------------------------------------------------------------------------
  async getCollaborationAnalytics() {
    const [voice, meetings, sessions, presence, warRooms] = await Promise.all([
      getDocs(collection(db, 'voiceRooms')),
      getDocs(collection(db, 'meetingRooms')),
      getDocs(query(collection(db, 'liveSessions'), limit(500))),
      getDocs(query(collection(db, 'presence'), limit(500))),
      getDocs(collection(db, 'teamWarRooms')),
    ]);

    const onlineCount = docsFrom(presence).filter(p => p.state === 'online' || p.state === 'collaborating').length;

    return {
      activeVoiceRooms: docsFrom(voice).filter(r => (r.participants || []).length > 0).length,
      totalMeetings: meetings.size,
      liveSessions: sessions.size,
      onlineMembers: onlineCount,
      warRooms: warRooms.size,
      meetingHoursEstimate: Math.round(sessions.size * 0.5),
      documentActivity: 0,
      topCollaborators: docsFrom(presence)
        .filter(p => p.state && p.state !== 'offline')
        .slice(0, 10)
        .map(p => ({ uid: p.uid, name: p.displayName, state: p.state })),
    };
  },

  async getOrganizationCollaborationIntel() {
    const analytics = await this.getCollaborationAnalytics();
    const snap = await getDocs(query(collection(db, 'collaborationSessions'), limit(100)));
    return {
      ...analytics,
      collaborationHeatmap: docsFrom(snap).slice(0, 12).map(s => ({
        id: s.id,
        type: s.sessionType,
        count: s.participantCount || 1,
      })),
      communicationPatterns: [
        { channel: 'Voice', share: 35 },
        { channel: 'Video', share: 25 },
        { channel: 'Chat', share: 30 },
        { channel: 'Documents', share: 10 },
      ],
    };
  },
};
