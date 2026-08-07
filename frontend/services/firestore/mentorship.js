import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const MentorshipService = {
  // ---------------------------------------------------------------------------
  // EXPERT DIRECTORY (Hybrid classification)
  // ---------------------------------------------------------------------------
  async getExperts() {
    const q = query(collection(db, 'expertProfiles'), where('isPublic', '==', true), orderBy('expertiseScore', 'desc'));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async confirmExpertise(userId, confirmedSkills) {
    const ref = doc(db, 'expertProfiles', userId);
    await setDoc(ref, {
      userId,
      confirmedSkills,
      isPublic: true,
      lastConfirmed: serverTimestamp()
    }, { merge: true });
  },

  // ---------------------------------------------------------------------------
  // MENTORSHIP
  // ---------------------------------------------------------------------------
  async scheduleSession(data, mentorId, menteeId) {
    const ref = await addDoc(collection(db, 'mentorshipSessions'), {
      ...data,
      mentorId,
      menteeId,
      status: 'SCHEDULED', // SCHEDULED, COMPLETED, CANCELLED
      createdAt: serverTimestamp(),
    });
    
    // This could also tie into the 'meetings' collection if we want direct BeastBuck video integration
    const meetingRef = await addDoc(collection(db, 'meetings'), {
      title: `Mentorship: ${data.topic}`,
      scheduledFor: data.scheduledFor,
      participants: [mentorId, menteeId],
      type: 'MENTORSHIP',
      mentorshipSessionId: ref.id,
      roomId: `mentor-${ref.id}`,
      createdAt: serverTimestamp()
    });

    // Update session with linked video room ID
    await updateDoc(ref, { roomId: meetingRef.id });

    return ref.id;
  },

  async getSessionsForUser(userId) {
    // Queries for both mentor and mentee, requires composite index in real life
    // For now we'll do mentor and in UI filter if needed, or two queries
    const qMentor = query(collection(db, 'mentorshipSessions'), where('mentorId', '==', userId));
    const snapMentor = await getDocs(qMentor);
    
    const qMentee = query(collection(db, 'mentorshipSessions'), where('menteeId', '==', userId));
    const snapMentee = await getDocs(qMentee);

    return [...docsFrom(snapMentor), ...docsFrom(snapMentee)];
  }
};
