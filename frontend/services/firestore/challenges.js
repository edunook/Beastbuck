import { db } from '@services/firebase/config';
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
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { GamificationService } from './gamification';
import { CHALLENGE_STATUS, SUBMISSION_STATUS } from '@shared/constants/challenges';

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
  },

  // ---------------------------------------------------------------------------
  // COMMUNITY CHALLENGES (Multi-type system)
  // ---------------------------------------------------------------------------
  async createCommunityChallenge(challengeData, creator) {
    const docRef = await addDoc(collection(db, 'communityChallenges'), {
      ...challengeData,
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      status: CHALLENGE_STATUS.DRAFT,
      participantCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateCommunityChallenge(challengeId, data) {
    await updateDoc(doc(db, 'communityChallenges', challengeId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCommunityChallenge(challengeId) {
    await deleteDoc(doc(db, 'communityChallenges', challengeId));
  },

  async getCommunityChallenges(filters = {}) {
    let q = query(collection(db, 'communityChallenges'), orderBy('createdAt', 'desc'));
    
    // Only use where clauses for indexed fields
    if (filters.creatorId) {
      q = query(collection(db, 'communityChallenges'), where('creatorId', '==', filters.creatorId), orderBy('createdAt', 'desc'));
    }
    if (filters.type) {
      q = query(collection(db, 'communityChallenges'), where('type', '==', filters.type), orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    let challenges = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side filtering for status to avoid index requirement
    if (filters.status) {
      challenges = challenges.filter(c => c.status === filters.status);
    }

    return challenges;
  },

  async getCommunityChallenge(challengeId) {
    const snap = await getDoc(doc(db, 'communityChallenges', challengeId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async publishChallenge(challengeId) {
    await updateDoc(doc(db, 'communityChallenges', challengeId), {
      status: CHALLENGE_STATUS.ACTIVE,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async closeChallenge(challengeId) {
    await updateDoc(doc(db, 'communityChallenges', challengeId), {
      status: CHALLENGE_STATUS.CLOSED,
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // CHALLENGE SUBMISSIONS
  // ---------------------------------------------------------------------------
  async submitChallengeResponse(challengeId, userId, userData, responseData) {
    const docRef = await addDoc(collection(db, 'challengeResponses'), {
      challengeId,
      userId,
      userName: userData.name,
      userUsername: userData.username,
      responseData,
      status: SUBMISSION_STATUS.PENDING,
      score: 0,
      rank: null,
      submittedAt: serverTimestamp(),
      reviewedAt: null,
    });

    // Increment participant count
    await updateDoc(doc(db, 'communityChallenges', challengeId), {
      participantCount: increment(1),
    });

    return docRef.id;
  },

  async getChallengeResponses(challengeId) {
    const snap = await getDocs(
      query(collection(db, 'challengeResponses'), where('challengeId', '==', challengeId), orderBy('submittedAt', 'desc'))
    );
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getUserResponse(challengeId, userId) {
    const snap = await getDocs(
      query(collection(db, 'challengeResponses'), where('challengeId', '==', challengeId), where('userId', '==', userId))
    );
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async reviewResponse(responseId, reviewData) {
    await updateDoc(doc(db, 'challengeResponses', responseId), {
      ...reviewData,
      status: SUBMISSION_STATUS.REVIEWED,
      reviewedAt: serverTimestamp(),
    });
  },

  async gradeResponse(responseId, score, rank, feedback) {
    await updateDoc(doc(db, 'challengeResponses', responseId), {
      score,
      rank,
      feedback,
      status: score >= 70 ? SUBMISSION_STATUS.ACCEPTED : SUBMISSION_STATUS.REJECTED,
      reviewedAt: serverTimestamp(),
    });
  },

  async getChallengeLeaderboard(challengeId) {
    const snap = await getDocs(
      query(collection(db, 'challengeResponses'), where('challengeId', '==', challengeId), orderBy('score', 'desc'))
    );
    return snap.docs.map((doc, index) => ({ 
      id: doc.id, 
      ...doc.data(),
      rank: index + 1
    }));
  },
};
