import { db } from './config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const GovernanceService = {
  // ---------------------------------------------------------------------------
  // REPUTATION ENGINE
  // ---------------------------------------------------------------------------
  async calculateReputation(userId) {
    const userSnap = await getDoc(doc(db, 'users', userId));
    const stats = userSnap.data()?.stats || {};
    
    // Core weights (simulated for immediate response)
    const contributionScore = (stats.completedTasks || 0) * 10;
    const collaborationScore = (stats.collaborations || 0) * 15;
    const innovationScore = (stats.inventions || 0) * 50;
    const researchScore = (stats.researchPublished || 0) * 40;
    const creatorScore = (stats.creatorScore || 0) * 5;
    const communityScore = (stats.communityHelp || 0) * 5;
    
    const baseReputation = contributionScore + collaborationScore + innovationScore + researchScore + creatorScore + communityScore;
    return Math.min(10000, baseReputation);
  },

  // ---------------------------------------------------------------------------
  // TRUST ENGINE
  // ---------------------------------------------------------------------------
  async calculateTrustLevel(userId, reputationScore) {
    const verifications = await getDocs(query(collection(db, 'memberVerifications'), where('userId', '==', userId), where('status', '==', 'VERIFIED')));
    const verificationBonus = verifications.size * 500;
    
    const totalScore = reputationScore + verificationBonus;
    
    if (totalScore >= 8000) return 'Elite';
    if (totalScore >= 5000) return 'Platinum';
    if (totalScore >= 2500) return 'Gold';
    if (totalScore >= 1000) return 'Silver';
    return 'Bronze';
  },

  async updateMemberGovernanceStats(userId) {
    const reputation = await this.calculateReputation(userId);
    const trustLevel = await this.calculateTrustLevel(userId, reputation);
    
    await updateDoc(doc(db, 'users', userId), {
      'stats.reputationScore': reputation,
      'stats.trustLevel': trustLevel,
      updatedAt: serverTimestamp()
    });
    
    return { reputation, trustLevel };
  },

  // ---------------------------------------------------------------------------
  // PROPOSALS & VOTING
  // ---------------------------------------------------------------------------
  async createProposal(data, user) {
    const ref = await addDoc(collection(db, 'governanceProposals'), {
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      creatorId: user.uid,
      creatorName: user.name,
      status: 'ACTIVE',
      votesYes: 0,
      votesNo: 0,
      votingWeight: 0,
      createdAt: serverTimestamp(),
      endsAt: data.endsAt || null,
    });
    return ref.id;
  },

  async getActiveProposals() {
    const snap = await getDocs(query(collection(db, 'governanceProposals'), where('status', '==', 'ACTIVE'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async castVote(proposalId, userId, voteType, userReputation) {
    // Voting weight is heavily influenced by reputation score
    const weight = Math.max(1, Math.floor(userReputation / 100));
    
    await setDoc(doc(db, 'governanceVotes', `${proposalId}_${userId}`), {
      proposalId,
      userId,
      voteType, // 'YES' or 'NO'
      weight,
      createdAt: serverTimestamp()
    });
    
    const updatePayload = voteType === 'YES' 
      ? { votesYes: increment(1), votingWeight: increment(weight) }
      : { votesNo: increment(1), votingWeight: increment(-weight) };
      
    await updateDoc(doc(db, 'governanceProposals', proposalId), updatePayload);
  },

  // ---------------------------------------------------------------------------
  // ELECTIONS HUB
  // ---------------------------------------------------------------------------
  async createElection(data) {
    const ref = await addDoc(collection(db, 'leadershipElections'), {
      title: data.title,
      role: data.role,
      type: data.type || 'ADVISORY', // ADVISORY, BINDING
      status: 'UPCOMING',
      createdAt: serverTimestamp(),
      startsAt: data.startsAt || serverTimestamp(),
      endsAt: data.endsAt || null,
    });
    return ref.id;
  },

  async applyForCandidacy(electionId, user, statement) {
    await setDoc(doc(db, 'electionCandidates', `${electionId}_${user.uid}`), {
      electionId,
      userId: user.uid,
      name: user.name,
      statement,
      votes: 0,
      status: 'APPROVED', // Normally requires admin approval
      createdAt: serverTimestamp()
    });
  },

  // ---------------------------------------------------------------------------
  // VERIFICATION CENTER
  // ---------------------------------------------------------------------------
  async submitVerification(userId, type, evidenceUrl) {
    await addDoc(collection(db, 'memberVerifications'), {
      userId,
      type, // 'IDENTITY', 'SKILL', 'FOUNDER', 'RESEARCHER'
      evidenceUrl,
      status: 'PENDING',
      createdAt: serverTimestamp()
    });
  },

  async approveVerification(verificationId, reviewerId) {
    const vDoc = await getDoc(doc(db, 'memberVerifications', verificationId));
    if (!vDoc.exists()) return;
    
    await updateDoc(doc(db, 'memberVerifications', verificationId), {
      status: 'VERIFIED',
      reviewerId,
      updatedAt: serverTimestamp()
    });
    
    // Trigger reputation update for the user
    await this.updateMemberGovernanceStats(vDoc.data().userId);
  },

  // ---------------------------------------------------------------------------
  // CONFLICT RESOLUTION
  // ---------------------------------------------------------------------------
  async createDispute(data, reporterId) {
    const ref = await addDoc(collection(db, 'conflictResolutions'), {
      title: data.title,
      description: data.description,
      reportedUserId: data.reportedUserId,
      reporterId,
      status: 'UNDER_REVIEW',
      severity: data.severity || 'MEDIUM',
      createdAt: serverTimestamp()
    });
    return ref.id;
  }
};
