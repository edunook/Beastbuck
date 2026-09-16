import { doc, setDoc, serverTimestamp, runTransaction, collection, getDocs, query, where, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { ROLES } from '@shared/constants/roles';
import { NotificationsService } from './notifications';

/**
 * Executive Service - Handles CEO/Co-CEO assignment and executive operations
 */

const EXECUTIVE_COLLECTION = 'users';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

/**
 * Helper to send user-facing Firestore notifications for executive actions
 */
export async function sendUserNotification(targetUid, { type, title, message, severity = 'info', reason = '' }) {
  if (!targetUid) return;
  try {
    const formattedMessage = reason && !message.includes(reason) 
      ? `${message} Reason: ${reason}` 
      : message;
    
    await NotificationsService.createNotification({
      title: title || 'Executive Notice',
      message: formattedMessage,
      type: type === 'MEMBERSHIP_REVOKED' || type === 'ACCOUNT_SUSPENDED' ? 'member_update' : 'member_join',
      category: 'personal',
      actorName: 'Executive Leadership',
      targetUid,
      link: '/dashboard',
      isPublic: false,
      isPrivate: true,
    });
  } catch (err) {
    console.warn('Failed sending executive user notification:', err);
  }
}

/**
 * Check if a CEO already exists in the system
 */
export async function checkCEOExists() {
  try {
    const q = query(
      collection(db, EXECUTIVE_COLLECTION),
      where('role', '==', ROLES.MAIN_CEO),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking CEO existence:', error);
    return false;
  }
}

/**
 * Assign CEO role to the very first user (one-time rule)
 * NOTE: This function is DEPRECATED and no longer used.
 * First-user CEO assignment is now handled atomically within AuthService.signUp
 * using a Firestore transaction to prevent race conditions.
 * This function is kept for reference but should not be called.
 */
export async function assignFirstCEO(uid, userData) {
  try {
    const ceoExists = await checkCEOExists();
    if (ceoExists) {
      return { success: false, reason: 'CEO already exists' };
    }

    // Assign CEO role to the first user
    await setDoc(doc(db, EXECUTIVE_COLLECTION, uid), {
      ...userData,
      role: ROLES.MAIN_CEO,
      membershipStatus: 'approved',
      isExecutive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Log the CEO assignment
    await logAuditEvent({
      type: 'CEO_ASSIGNED',
      actorId: uid,
      targetId: uid,
      summary: 'First user automatically assigned as Main CEO',
      details: { autoAssigned: true }
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning CEO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Promote a member to Co-CEO (CEO only)
 */
export async function promoteToCoCEO(actorUid, targetUid, reason = '') {
  try {
    await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      if (actorData.role !== ROLES.MAIN_CEO) {
        throw new Error('Only Main CEO can promote to Co-CEO');
      }

      // ── Enforce ONE Co-CEO limit ──────────────────────────────────────
      // We do a regular getDocs outside the transaction for the check
      // (transactions only support get() on DocumentRefs, not queries).
      // The backend Firestore Security Rules enforce this server-side too.
      const existingCoCEOQuery = query(
        collection(db, EXECUTIVE_COLLECTION),
        where('role', '==', ROLES.CO_CEO),
        limit(1)
      );
      const existingCoCEOSnap = await getDocs(existingCoCEOQuery);
      if (!existingCoCEOSnap.empty) {
        throw new Error('A Co-CEO already exists. Remove the current Co-CEO before promoting a new one.');
      }
      // ─────────────────────────────────────────────────────────────────

      const targetData = targetDoc.data();
      if (targetData.role === ROLES.MAIN_CEO || targetData.role === ROLES.CO_CEO) {
        throw new Error('User is already an executive');
      }

      // Update target user to Co-CEO
      transaction.update(targetRef, {
        role: ROLES.CO_CEO,
        isExecutive: true,
        promotedBy: actorUid,
        promotedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    // Log the promotion
    await logAuditEvent({
      type: 'ROLE_CHANGED',
      actorId: actorUid,
      targetId: targetUid,
      summary: 'Promoted to Co-CEO',
      details: { newRole: ROLES.CO_CEO, reason }
    });

    await sendUserNotification(targetUid, {
      type: 'ROLE_CHANGED',
      title: '👑 Appointed as Co-CEO',
      message: `You have been appointed as Co-CEO by the Main CEO.${reason ? ` Reason: ${reason}` : ''}`,
      severity: 'success',
      reason
    });

    return { success: true };
  } catch (error) {
    console.error('Error promoting to Co-CEO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Resign as Main CEO — strips the CEO's role back to Member.
 * Requires that no position successor is needed (or use designateSuccessor instead).
 */
export async function resignAsCEO(actorUid, reason = '') {
  try {
    await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const actorDoc = await transaction.get(actorRef);

      if (!actorDoc.exists()) throw new Error('User not found');

      const actorData = actorDoc.data();
      if (actorData.role !== ROLES.MAIN_CEO) {
        throw new Error('Only the Main CEO can use this action');
      }

      transaction.update(actorRef, {
        role: ROLES.MEMBER,
        isExecutive: false,
        resignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await logAuditEvent({
      type: 'CEO_RESIGNED',
      actorId: actorUid,
      targetId: actorUid,
      summary: 'Main CEO resigned from position',
      details: { reason }
    });

    return { success: true };
  } catch (error) {
    console.error('Error resigning as CEO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Designate a successor: atomically transfers the Main CEO role
 * to the chosen member and demotes the current CEO to Member.
 */
export async function designateSuccessor(actorUid, successorUid, reason = '') {
  try {
    await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const successorRef = doc(db, EXECUTIVE_COLLECTION, successorUid);

      const actorDoc = await transaction.get(actorRef);
      const successorDoc = await transaction.get(successorRef);

      if (!actorDoc.exists() || !successorDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      if (actorData.role !== ROLES.MAIN_CEO) {
        throw new Error('Only the Main CEO can designate a successor');
      }

      // Demote current CEO to Member
      transaction.update(actorRef, {
        role: ROLES.MEMBER,
        isExecutive: false,
        resignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Promote successor to Main CEO
      transaction.update(successorRef, {
        role: ROLES.MAIN_CEO,
        isExecutive: true,
        promotedBy: actorUid,
        promotedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await logAuditEvent({
      type: 'CEO_SUCCESSION',
      actorId: actorUid,
      targetId: successorUid,
      summary: 'Main CEO transferred leadership via succession',
      details: { newCeoUid: successorUid, reason }
    });

    await sendUserNotification(successorUid, {
      type: 'ROLE_CHANGED',
      title: '👑 Appointed as Main CEO',
      message: `You have been designated as the new Main CEO.${reason ? ` Reason: ${reason}` : ''}`,
      severity: 'success',
      reason
    });

    return { success: true };
  } catch (error) {
    console.error('Error designating successor:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove Co-CEO role (CEO only)
 */
export async function removeCoCEO(actorUid, targetUid, reason = '') {
  try {
    await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      if (actorData.role !== ROLES.MAIN_CEO) {
        throw new Error('Only Main CEO can remove Co-CEO');
      }

      const targetData = targetDoc.data();
      if (targetData.role !== ROLES.CO_CEO) {
        throw new Error('User is not a Co-CEO');
      }

      // Demote to Member
      transaction.update(targetRef, {
        role: ROLES.MEMBER,
        isExecutive: false,
        demotedBy: actorUid,
        demotedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    // Log the demotion
    await logAuditEvent({
      type: 'ROLE_CHANGED',
      actorId: actorUid,
      targetId: targetUid,
      summary: 'Removed from Co-CEO',
      details: { previousRole: ROLES.CO_CEO, newRole: ROLES.MEMBER, reason }
    });

    await sendUserNotification(targetUid, {
      type: 'ROLE_CHANGED',
      title: 'Executive Role Updated',
      message: `Your Co-CEO designation has been revoked.${reason ? ` Reason: ${reason}` : ''}`,
      severity: 'warning',
      reason
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing Co-CEO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all executive members (CEO and Co-CEOs)
 */
export async function getExecutives() {
  try {
    const q = query(
      collection(db, EXECUTIVE_COLLECTION),
      where('isExecutive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching executives:', error);
    return [];
  }
}

/**
 * Log audit event for executive actions
 */
async function logAuditEvent(eventData) {
  try {
    const logRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    await setDoc(logRef, {
      ...eventData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Get platform statistics for Mission Control
 */
export async function getPlatformStats() {
  try {
    // This would normally be computed from actual collections
    // For now, return mock data that will be replaced with real aggregation
    const stats = {
      totalUsers: 0,
      totalMembers: 0,
      pendingMemberships: 0,
      departments: 0,
      teams: 0,
      projects: 0,
      researchPapers: 0,
      experiments: 0,
      products: 0,
      marketplaceListings: 0,
      aiModels: 0,
      funflixMovies: 0,
      events: 0,
      communities: 0,
      storageUsed: 0,
      realtimeConnections: 0,
      onlineMembers: 0,
      visitors: 0
    };

    // Count total users
    const usersSnapshot = await getDocs(collection(db, EXECUTIVE_COLLECTION));
    stats.totalUsers = usersSnapshot.size;

    // Count approved members
    const membersQuery = query(
      collection(db, EXECUTIVE_COLLECTION),
      where('membershipStatus', '==', 'approved')
    );
    const membersSnapshot = await getDocs(membersQuery);
    stats.totalMembers = membersSnapshot.size;

    // Count pending memberships
    const pendingQuery = query(
      collection(db, EXECUTIVE_COLLECTION),
      where('membershipStatus', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    stats.pendingMemberships = pendingSnapshot.size;

    return stats;
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return null;
  }
}

/**
 * Get organization health metrics
 */
export async function getOrganizationHealth() {
  // Mock data - replace with real aggregation
  return {
    growth: 15,
    activity: 78,
    engagement: 82,
    memberRetention: 91,
    researchOutput: 67,
    innovationScore: 73,
    learningProgress: 85,
    communityHealth: 88,
    overallEcosystemScore: 79
  };
}

/**
 * Get real-time activity feed
 */
export async function getActivityFeed(limit = 20) {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}



/**
 * Demote a Member to standard User (Main CEO & Co-CEO only)
 */
export async function demoteMemberToUser(actorUid, targetUid, reason = '') {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      const isActorCeo = actorData.role === ROLES.MAIN_CEO || actorData.role === 'Main CEO';
      const isActorCoCeo = actorData.role === ROLES.CO_CEO || actorData.role === 'Co-CEO';
      if (!isActorCeo && !isActorCoCeo) {
        throw new Error('Only Main CEO or Co-CEO can demote members');
      }

      const targetData = targetDoc.data();
      if (targetData.role === ROLES.MAIN_CEO || targetData.role === ROLES.CO_CEO || targetData.isExecutive) {
        throw new Error('Cannot demote an Executive (Main CEO or Co-CEO)');
      }

      transaction.update(targetRef, {
        role: ROLES.USER,
        membershipStatus: 'revoked',
        isExecutive: false,
        suspended: false,
        suspendedUntil: null,
        accountStatus: 'user',
        demotedAt: serverTimestamp(),
        demotedBy: actorUid,
        demoteReason: reason || 'Demoted from Member to User by Executive',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    });

    await logAuditEvent({
      type: 'MEMBER_DEMOTED_TO_USER',
      actorId: actorUid,
      targetId: targetUid,
      summary: 'Member demoted to standard User',
      details: { reason, previousRole: ROLES.MEMBER, newRole: ROLES.USER }
    });

    await sendUserNotification(targetUid, {
      type: 'MEMBERSHIP_REVOKED',
      title: 'Membership Status Changed',
      message: `Your membership has been revoked by executive leadership. Your account is now a standard User.${reason ? ` Reason: ${reason}` : ''}`,
      severity: 'warning'
    });

    return result;
  } catch (error) {
    console.error('Error demoting member to user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Suspend a Member for a specific time period (Main CEO & Co-CEO only)
 */
export async function suspendMember(actorUid, targetUid, { durationHours, customUntilDate, reason = '' }) {
  try {
    let untilDate = null;
    if (customUntilDate) {
      untilDate = new Date(customUntilDate);
    } else if (durationHours) {
      untilDate = new Date(Date.now() + Number(durationHours) * 3600 * 1000);
    } else {
      untilDate = new Date(Date.now() + 24 * 3600 * 1000); // default 24h
    }

    if (isNaN(untilDate.getTime())) {
      throw new Error('Invalid suspension end date or duration');
    }

    const isoUntil = untilDate.toISOString();

    const result = await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      const isActorCeo = actorData.role === ROLES.MAIN_CEO || actorData.role === 'Main CEO';
      const isActorCoCeo = actorData.role === ROLES.CO_CEO || actorData.role === 'Co-CEO';
      if (!isActorCeo && !isActorCoCeo) {
        throw new Error('Only Main CEO or Co-CEO can suspend members');
      }

      const targetData = targetDoc.data();
      if (targetData.role === ROLES.MAIN_CEO || targetData.role === ROLES.CO_CEO || targetData.isExecutive) {
        throw new Error('Cannot suspend an Executive (Main CEO or Co-CEO)');
      }

      transaction.update(targetRef, {
        suspended: true,
        accountStatus: 'suspended',
        suspendedAt: serverTimestamp(),
        suspendedUntil: isoUntil,
        suspendedReason: reason || 'Temporary suspension applied by Executive',
        suspendedBy: actorUid,
        updatedAt: serverTimestamp()
      });

      return { success: true, suspendedUntil: isoUntil };
    });

    await logAuditEvent({
      type: 'MEMBER_SUSPENDED',
      actorId: actorUid,
      targetId: targetUid,
      summary: `Member suspended until ${untilDate.toLocaleString()}`,
      details: { reason, suspendedUntil: isoUntil, durationHours }
    });

    await sendUserNotification(targetUid, {
      type: 'ACCOUNT_SUSPENDED',
      title: 'Membership Temporarily Suspended',
      message: `Your membership privileges have been temporarily suspended until ${untilDate.toLocaleString()}.${reason ? ` Reason: ${reason}` : ''}`,
      severity: 'danger'
    });

    return result;
  } catch (error) {
    console.error('Error suspending member:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lift suspension on a Member early (Main CEO & Co-CEO only)
 */
export async function unsuspendMember(actorUid, targetUid, reason = '') {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      const isActorCeo = actorData.role === ROLES.MAIN_CEO || actorData.role === 'Main CEO';
      const isActorCoCeo = actorData.role === ROLES.CO_CEO || actorData.role === 'Co-CEO';
      if (!isActorCeo && !isActorCoCeo) {
        throw new Error('Only Main CEO or Co-CEO can unsuspend members');
      }

      transaction.update(targetRef, {
        suspended: false,
        accountStatus: 'active',
        suspendedUntil: null,
        unsuspendedAt: serverTimestamp(),
        unsuspendedBy: actorUid,
        unsuspendReason: reason || 'Suspension lifted by Executive',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    });

    await logAuditEvent({
      type: 'MEMBER_UNSUSPENDED',
      actorId: actorUid,
      targetId: targetUid,
      summary: 'Member suspension lifted',
      details: { reason }
    });

    await sendUserNotification(targetUid, {
      type: 'ACCOUNT_UNSUSPENDED',
      title: 'Membership Restored',
      message: `Your membership suspension has been lifted by executive leadership. You now have full member privileges.`,
      severity: 'success'
    });

    return result;
  } catch (error) {
    console.error('Error unsuspending member:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reinstate a User back to Member (Main CEO & Co-CEO only)
 */
export async function reinstateMember(actorUid, targetUid, reason = '') {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const actorRef = doc(db, EXECUTIVE_COLLECTION, actorUid);
      const targetRef = doc(db, EXECUTIVE_COLLECTION, targetUid);

      const actorDoc = await transaction.get(actorRef);
      const targetDoc = await transaction.get(targetRef);

      if (!actorDoc.exists() || !targetDoc.exists()) {
        throw new Error('User not found');
      }

      const actorData = actorDoc.data();
      const isActorCeo = actorData.role === ROLES.MAIN_CEO || actorData.role === 'Main CEO';
      const isActorCoCeo = actorData.role === ROLES.CO_CEO || actorData.role === 'Co-CEO';
      if (!isActorCeo && !isActorCoCeo) {
        throw new Error('Only Main CEO or Co-CEO can reinstate members');
      }

      transaction.update(targetRef, {
        role: ROLES.MEMBER,
        membershipStatus: 'approved',
        suspended: false,
        suspendedUntil: null,
        accountStatus: 'active',
        reinstatedAt: serverTimestamp(),
        reinstatedBy: actorUid,
        reinstateReason: reason || 'Reinstated as Member by Executive',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    });

    await logAuditEvent({
      type: 'MEMBER_REINSTATED',
      actorId: actorUid,
      targetId: targetUid,
      summary: 'User reinstated to Member',
      details: { reason }
    });

    await sendUserNotification(targetUid, {
      type: 'MEMBERSHIP_REINSTATED',
      title: 'Membership Approved',
      message: `Congratulations! Your membership has been reinstated with full member privileges.${reason ? ` Reason / Notes: ${reason}` : ''}`,
      severity: 'success',
      reason
    });

    return result;
  } catch (error) {
    console.error('Error reinstating member:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all accounts for moderation overview
 */
export async function getAllAccountsForModeration() {
  try {
    const usersRef = collection(db, EXECUTIVE_COLLECTION);
    const snap = await getDocs(usersRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching accounts for moderation:', error);
    return [];
  }
}

/**
 * Fetch moderation audit logs
 */
export async function getModerationAuditLogs(maxLogs = 30) {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('type', 'in', ['MEMBER_DEMOTED_TO_USER', 'MEMBER_SUSPENDED', 'MEMBER_UNSUSPENDED', 'MEMBER_REINSTATED']),
      limit(maxLogs)
    );
    const snap = await getDocs(q);
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    logs.sort((a, b) => {
      const tA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
      const tB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
      return tB - tA;
    });
    return logs;
  } catch (error) {
    console.warn('Moderation logs indexed query fallback:', error.message);
    try {
      const snap = await getDocs(query(collection(db, AUDIT_LOGS_COLLECTION), limit(maxLogs * 2)));
      const logs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(l => ['MEMBER_DEMOTED_TO_USER', 'MEMBER_SUSPENDED', 'MEMBER_UNSUSPENDED', 'MEMBER_REINSTATED'].includes(l.type));
      logs.sort((a, b) => {
        const tA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
        const tB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
        return tB - tA;
      });
      return logs.slice(0, maxLogs);
    } catch (err) {
      console.error('Fallback moderation logs failed:', err);
      return [];
    }
  }
}
