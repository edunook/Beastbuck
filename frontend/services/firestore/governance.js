import { db } from '@services/firebase/config';
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
  deleteDoc,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const GovernanceService = {
  // ---------------------------------------------------------------------------
  // ORGANIZATION HEALTH
  // ---------------------------------------------------------------------------
  async getOrganizationHealth() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = docsFrom(usersSnap);

      const totalMembers = users.filter(u => u.membershipStatus === 'approved').length;
      const activeMembers = users.filter(u => u.accountStatus === 'active').length;
      const inactiveMembers = users.filter(u => u.accountStatus === 'suspended').length;

      // Count departments
      const departmentsSnap = await getDocs(collection(db, 'departments'));
      const departments = docsFrom(departmentsSnap);

      // Count teams
      const teamsSnap = await getDocs(collection(db, 'teams'));
      const teams = docsFrom(teamsSnap);

      // Count projects
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const projects = docsFrom(projectsSnap);

      // Count research
      const researchSnap = await getDocs(collection(db, 'research'));
      const research = docsFrom(researchSnap);

      // Count experiments
      const experimentsSnap = await getDocs(collection(db, 'experiments'));
      const experiments = docsFrom(experimentsSnap);

      // Count products
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = docsFrom(productsSnap);

      // Count marketplace listings
      const marketplaceSnap = await getDocs(collection(db, 'marketplace'));
      const marketplace = docsFrom(marketplaceSnap);

      // Count AI models
      const aiSnap = await getDocs(collection(db, 'aiModels'));
      const aiModels = docsFrom(aiSnap);

      // Count FunFlix movies
      const funflixSnap = await getDocs(collection(db, 'funflix'));
      const funflix = docsFrom(funflixSnap);

      // Count pending reviews
      const pendingReviews = users.filter(u => u.membershipStatus === 'pending').length;

      // Calculate organization score
      const engagementScore = Math.min(100, (activeMembers / (totalMembers || 1)) * 100);
      const growthScore = Math.min(100, (departments.length * 10) + (teams.length * 5));
      const innovationScore = Math.min(100, (research.length * 2) + (aiModels.length * 3));
      const communityScore = Math.min(100, (projects.length * 3) + (products.length * 2));
      const organizationScore = Math.round((engagementScore + growthScore + innovationScore + communityScore) / 4);
      const growthRate = Math.round((activeMembers / (totalMembers || 1)) * 100);

      return {
        totalMembers,
        activeMembers,
        inactiveMembers,
        departments: departments.length,
        teams: teams.length,
        projects: projects.length,
        research: research.length,
        experiments: experiments.length,
        products: products.length,
        marketplaceListings: marketplace.length,
        publishedAIs: aiModels.length,
        funflixMovies: funflix.length,
        pendingReviews,
        organizationScore,
        growthRate,
        communityHealth: communityScore,
      };
    } catch (error) {
      console.error('Error fetching organization health:', error);
      return null;
    }
  },

  // ---------------------------------------------------------------------------
  // DEPARTMENT MANAGEMENT
  // ---------------------------------------------------------------------------
  async createDepartment(data, creatorId) {
    const ref = await addDoc(collection(db, 'departments'), {
      name: data.name,
      description: data.description || '',
      leaderId: data.leaderId || null,
      memberCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      createdBy: creatorId,
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getDepartments() {
    const snap = await getDocs(query(collection(db, 'departments'), where('status', '==', 'active'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async updateDepartment(departmentId, data) {
    await updateDoc(doc(db, 'departments', departmentId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async archiveDepartment(departmentId) {
    await updateDoc(doc(db, 'departments', departmentId), {
      status: 'archived',
      archivedAt: serverTimestamp(),
    });
  },

  async deleteDepartment(departmentId) {
    await deleteDoc(doc(db, 'departments', departmentId));
  },

  async assignDepartmentLeader(departmentId, leaderId) {
    await updateDoc(doc(db, 'departments', departmentId), {
      leaderId,
      updatedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // TEAM MANAGEMENT
  // ---------------------------------------------------------------------------
  async createTeam(data, creatorId) {
    const ref = await addDoc(collection(db, 'teams'), {
      name: data.name,
      description: data.description || '',
      departmentId: data.departmentId || null,
      leaderId: data.leaderId || null,
      memberCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      createdBy: creatorId,
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getTeams() {
    const snap = await getDocs(query(collection(db, 'teams'), where('status', '==', 'active'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async getTeamsByDepartment(departmentId) {
    const snap = await getDocs(query(collection(db, 'teams'), where('departmentId', '==', departmentId), where('status', '==', 'active')));
    return docsFrom(snap);
  },

  async updateTeam(teamId, data) {
    await updateDoc(doc(db, 'teams', teamId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTeam(teamId) {
    await deleteDoc(doc(db, 'teams', teamId));
  },

  async assignTeamLeader(teamId, leaderId) {
    await updateDoc(doc(db, 'teams', teamId), {
      leaderId,
      updatedAt: serverTimestamp(),
    });
  },

  async transferTeam(teamId, newDepartmentId) {
    await updateDoc(doc(db, 'teams', teamId), {
      departmentId: newDepartmentId,
      updatedAt: serverTimestamp(),
    });
  },

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

  async getAllProposals() {
    const snap = await getDocs(query(collection(db, 'governanceProposals'), orderBy('createdAt', 'desc')));
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

  async closeProposal(proposalId, result) {
    await updateDoc(doc(db, 'governanceProposals', proposalId), {
      status: 'CLOSED',
      result,
      closedAt: serverTimestamp(),
    });
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

  async getElections() {
    const snap = await getDocs(query(collection(db, 'leadershipElections'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
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

  async getCandidates(electionId) {
    const snap = await getDocs(query(collection(db, 'electionCandidates'), where('electionId', '==', electionId)));
    return docsFrom(snap);
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

  async getVerifications() {
    const snap = await getDocs(query(collection(db, 'memberVerifications'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
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
  },

  async getDisputes() {
    const snap = await getDocs(query(collection(db, 'conflictResolutions'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async resolveDispute(disputeId, resolution, resolverId) {
    await updateDoc(doc(db, 'conflictResolutions', disputeId), {
      status: 'RESOLVED',
      resolution,
      resolverId,
      resolvedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // POLICY CENTER
  // ---------------------------------------------------------------------------
  async createPolicy(data, creatorId) {
    const ref = await addDoc(collection(db, 'policies'), {
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      status: 'DRAFT',
      createdBy: creatorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getPolicies() {
    const snap = await getDocs(query(collection(db, 'policies'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  },

  async updatePolicy(policyId, data) {
    await updateDoc(doc(db, 'policies', policyId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async publishPolicy(policyId) {
    await updateDoc(doc(db, 'policies', policyId), {
      status: 'PUBLISHED',
      publishedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // MEETING CENTER
  // ---------------------------------------------------------------------------
  async createMeeting(data, creatorId) {
    const ref = await addDoc(collection(db, 'meetings'), {
      title: data.title,
      description: data.description,
      scheduledFor: data.scheduledFor,
      attendees: data.attendees || [],
      status: 'SCHEDULED',
      createdBy: creatorId,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getMeetings() {
    const snap = await getDocs(query(collection(db, 'meetings'), orderBy('scheduledFor', 'desc')));
    return docsFrom(snap);
  },

  async updateMeeting(meetingId, data) {
    await updateDoc(doc(db, 'meetings', meetingId), data);
  },

  async completeMeeting(meetingId, summary) {
    await updateDoc(doc(db, 'meetings', meetingId), {
      status: 'COMPLETED',
      summary,
      completedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // AUDIT LOGS
  // ---------------------------------------------------------------------------
  async getAuditLogs(limit = 50) {
    const snap = await getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(limit)));
    return docsFrom(snap);
  },

  async logAuditEvent(eventData) {
    await addDoc(collection(db, 'auditLogs'), {
      ...eventData,
      createdAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // AUTOMATION CONTROL
  // ---------------------------------------------------------------------------
  async getAutomations() {
    const snap = await getDocs(query(collection(db, 'automations'), where('status', '==', 'active')));
    return docsFrom(snap);
  },

  async toggleAutomation(automationId, status) {
    await updateDoc(doc(db, 'automations', automationId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // ---------------------------------------------------------------------------
  // CRITICAL ALERTS
  // ---------------------------------------------------------------------------
  async getCriticalAlerts() {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'alerts'),
          where('severity', '==', 'critical'),
          where('resolved', '==', false),
          orderBy('createdAt', 'desc')
        )
      );
      return docsFrom(snap);
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      return [];
    }
  },

  async createAlert(alertData) {
    await addDoc(collection(db, 'alerts'), {
      ...alertData,
      resolved: false,
      createdAt: serverTimestamp(),
    });
  },

  async resolveAlert(alertId) {
    await updateDoc(doc(db, 'alerts', alertId), {
      resolved: true,
      resolvedAt: serverTimestamp(),
    });
  },
};
