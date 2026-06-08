import { db } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { GamificationService } from './gamification';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const ChallengeService = {
  // ---------------------------------------------------------------------------
  // CHALLENGES
  // ---------------------------------------------------------------------------
  async getChallenges(eventId = null) {
    let q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    if (eventId) {
      q = query(collection(db, 'challenges'), where('eventId', '==', eventId), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getChallenge(challengeId) {
    if (!challengeId) return null;
    const snap = await getDoc(doc(db, 'challenges', challengeId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async createChallenge(challengeData, actorId) {
    const newDoc = doc(collection(db, 'challenges'));
    await setDoc(newDoc, {
      ...challengeData,
      createdBy: actorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc.id;
  },

  async updateChallenge(challengeId, challengeData, actorId) {
    await updateDoc(doc(db, 'challenges', challengeId), {
      ...challengeData,
      updatedBy: actorId,
      updatedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // SUBMISSIONS
  // ---------------------------------------------------------------------------
  async submitChallengeEntry(challengeId, userId, entryData) {
    const newDoc = doc(collection(db, 'challengeSubmissions'));
    await setDoc(newDoc, {
      id: newDoc.id,
      challengeId,
      userId,
      ...entryData,
      status: 'SUBMITTED', // SUBMITTED, WINNER, RUNNER_UP
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc.id;
  },

  async getSubmissions(challengeId) {
    const snap = await getDocs(
      query(collection(db, 'challengeSubmissions'), where('challengeId', '==', challengeId), orderBy('createdAt', 'desc'))
    );
    const submissions = docsFrom(snap);

    if (submissions.length === 0) return [];

    // Fetch user details
    const userIds = submissions.map(s => s.userId);
    const users = [];
    for (let i = 0; i < userIds.length; i += 10) {
      const chunk = userIds.slice(i, i + 10);
      const userSnap = await getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)));
      users.push(...docsFrom(userSnap));
    }

    return submissions.map(s => {
      const u = users.find(user => user.id === s.userId) || { displayName: 'Unknown', username: 'unknown' };
      return { ...s, user: u };
    });
  },

  // ---------------------------------------------------------------------------
  // AWARDING WINNERS
  // ---------------------------------------------------------------------------
  async awardWinner(submissionId, { xpAmount, badgeId, actorId }) {
    const submissionSnap = await getDoc(doc(db, 'challengeSubmissions', submissionId));
    if (!submissionSnap.exists()) throw new Error('Submission not found');
    const submission = submissionSnap.data();

    // 1. Mark submission as WINNER
    await updateDoc(doc(db, 'challengeSubmissions', submissionId), {
      status: 'WINNER',
      awardedAt: serverTimestamp(),
      awardedBy: actorId,
    });

    // 2. Award XP via GamificationService
    if (xpAmount && Number(xpAmount) > 0) {
      await GamificationService.awardXP({
        uid: submission.userId,
        amount: Number(xpAmount),
        reason: `Challenge Winner: ${submission.challengeId}`,
        sourceType: 'CHALLENGE_WIN', // Added new pseudo-type
        sourceId: submission.challengeId,
        actorId,
      });
    }

    // 3. Grant Badge/Achievement if provided
    if (badgeId) {
      try {
        await GamificationService.grantAchievement({
          uid: submission.userId,
          achievementId: badgeId,
          actorId,
        });
      } catch {
        // Fallback to assignBadge if achievement doesn't exist
        await GamificationService.assignBadge(submission.userId, badgeId);
      }
    } else {
      // If no badge, issue a generic EVENT_WINNER certificate
      try {
        const { CertificateService } = await import('./certificates');
        await CertificateService.issueCertificate({
          userId: submission.userId,
          type: 'EVENT_WINNER',
          title: `Winner: ${submission.challengeId}`,
          description: `Awarded for winning the challenge in event ${submission.challengeId}`,
          actorId,
        });
      } catch (err) {
        console.error('Failed to issue certificate for challenge win:', err);
      }
    }
  }
};
