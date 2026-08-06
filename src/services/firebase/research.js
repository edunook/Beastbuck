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
  arrayUnion,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const ResearchService = {
  // ---------------------------------------------------------------------------
  // RESEARCH MANAGEMENT
  // ---------------------------------------------------------------------------
  async createResearch(data, authorId) {
    const ref = await addDoc(collection(db, 'research'), {
      ...data,
      authorId,
      status: 'draft',
      views: 0,
      downloads: 0,
      bookmarks: 0,
      likes: 0,
      comments: 0,
      citations: 0,
      shares: 0,
      xp: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getResearch() {
    const snap = await getDocs(query(collection(db, 'research'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async getResearchById(researchId) {
    const snap = await getDoc(doc(db, 'research', researchId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async updateResearch(researchId, data) {
    await updateDoc(doc(db, 'research', researchId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async publishResearch(researchId) {
    await updateDoc(doc(db, 'research', researchId), {
      status: 'published',
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async incrementViews(researchId) {
    await updateDoc(doc(db, 'research', researchId), {
      views: increment(1),
    });
  },

  async likeResearch(researchId, userId) {
    const researchRef = doc(db, 'research', researchId);
    const userRef = doc(db, 'users', userId);

    await updateDoc(researchRef, {
      likes: increment(1),
    });

    await updateDoc(userRef, {
      'stats.researchLikes': increment(1),
    });
  },

  async bookmarkResearch(researchId, userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedResearch: arrayUnion(researchId),
    });
  },

  // ---------------------------------------------------------------------------
  // RESEARCH LEVELS & XP
  // ---------------------------------------------------------------------------
  async calculateResearchLevel(xp) {
    const levels = [
      { name: 'Beginner Explorer', xp: 0 },
      { name: 'Junior Researcher', xp: 100 },
      { name: 'Research Apprentice', xp: 500 },
      { name: 'Research Contributor', xp: 1500 },
      { name: 'Senior Researcher', xp: 3000 },
      { name: 'Innovation Expert', xp: 6000 },
      { name: 'Lead Scientist', xp: 10000 },
      { name: 'Research Legend', xp: 20000 },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].xp) {
        return levels[i];
      }
    }
    return levels[0];
  },

  async addResearchXP(userId, amount) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentXP = userData?.stats?.researchXP || 0;
    const newXP = currentXP + amount;
    const level = await this.calculateResearchLevel(newXP);

    await updateDoc(userRef, {
      'stats.researchXP': newXP,
      'stats.researchLevel': level.name,
    });

    return { newXP, level };
  },

  // ---------------------------------------------------------------------------
  // RESEARCH CERTIFICATES
  // ---------------------------------------------------------------------------
  async awardCertificate(userId, certificateType) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.researchCertificates': arrayUnion(certificateType),
    });
  },

  async checkAndAwardCertificates(userId, stats) {
    const certificates = [];
    
    if (stats.researchCount === 1) certificates.push('First Research');
    if (stats.researchCount >= 10) certificates.push('10 Research Papers');
    if (stats.researchLikes >= 100) certificates.push('Most Helpful');
    if (stats.researchBookmarks >= 50) certificates.push('Community Favorite');
    if (stats.researchCitations >= 10) certificates.push('Innovation Award');
    if (stats.researchXP >= 5000) certificates.push('Research Marathon');
    if (stats.researchXP >= 10000) certificates.push('Young Scientist');

    for (const cert of certificates) {
      await this.awardCertificate(userId, cert);
    }

    return certificates;
  },

  // ---------------------------------------------------------------------------
  // RESEARCH CHALLENGES
  // ---------------------------------------------------------------------------
  async createChallenge(data) {
    const ref = await addDoc(collection(db, 'researchChallenges'), {
      ...data,
      status: 'active',
      participants: 0,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getChallenges() {
    const snap = await getDocs(query(collection(db, 'researchChallenges'), where('status', '==', 'active')));
    return docsFrom(snap);
  },

  async joinChallenge(challengeId, userId) {
    await updateDoc(doc(db, 'researchChallenges', challengeId), {
      participants: increment(1),
    });

    await setDoc(doc(db, 'challengeParticipants', `${challengeId}_${userId}`), {
      challengeId,
      userId,
      joinedAt: serverTimestamp(),
      completed: false,
    });
  },

  async completeChallenge(challengeId, userId, submission) {
    await updateDoc(doc(db, 'challengeParticipants', `${challengeId}_${userId}`), {
      completed: true,
      completedAt: serverTimestamp(),
      submission,
    });

    await this.addResearchXP(userId, 100);
  },

  // ---------------------------------------------------------------------------
  // RESEARCH ANALYTICS
  // ---------------------------------------------------------------------------
  async getResearchAnalytics(researchId) {
    const researchSnap = await getDoc(doc(db, 'research', researchId));
    const research = researchSnap.data();

    return {
      views: research?.views || 0,
      downloads: research?.downloads || 0,
      bookmarks: research?.bookmarks || 0,
      likes: research?.likes || 0,
      comments: research?.comments || 0,
      citations: research?.citations || 0,
      shares: research?.shares || 0,
    };
  },

  async getUserResearchStats(userId) {
    const snap = await getDocs(query(collection(db, 'research'), where('authorId', '==', userId)));
    const research = docsFrom(snap);

    return {
      totalResearch: research.length,
      totalViews: research.reduce((sum, r) => sum + (r.views || 0), 0),
      totalDownloads: research.reduce((sum, r) => sum + (r.downloads || 0), 0),
      totalLikes: research.reduce((sum, r) => sum + (r.likes || 0), 0),
      totalCitations: research.reduce((sum, r) => sum + (r.citations || 0), 0),
    };
  },

  // ---------------------------------------------------------------------------
  // RESEARCH COLLABORATION
  // ---------------------------------------------------------------------------
  async inviteCollaborator(researchId, inviterId, inviteeId) {
    await addDoc(collection(db, 'collaborationInvites'), {
      researchId,
      inviterId,
      inviteeId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  },

  async acceptCollaboration(inviteId) {
    await updateDoc(doc(db, 'collaborationInvites', inviteId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
  },

  async addCollaborator(researchId, userId) {
    await updateDoc(doc(db, 'research', researchId), {
      collaborators: arrayUnion(userId),
    });
  },

  // ---------------------------------------------------------------------------
  // FUN RESEARCH MODE
  // ---------------------------------------------------------------------------
  async simplifyResearch(researchId) {
    const research = await this.getResearchById(researchId);
    if (!research) return null;

    // Simulated AI simplification
    return {
      originalTitle: research.title,
      simplifiedTitle: `${research.title} (Made Simple!)`,
      story: `Imagine ${research.title} is like a story where...`,
      cartoon: '🎬 Visual explanation would go here',
      simpleExample: 'Think of it like this: everyday example...',
      funnyComparison: `It's like comparing ${research.title} to pizza!`,
      realWorldExample: 'In real life, this happens when...',
    };
  },
};
