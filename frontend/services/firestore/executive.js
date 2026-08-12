import { doc, setDoc, serverTimestamp, runTransaction, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { ROLES } from '@shared/constants/roles';

/**
 * Executive Service - Handles CEO/Co-CEO assignment and executive operations
 */

const EXECUTIVE_COLLECTION = 'users';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

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

    return { success: true };
  } catch (error) {
    console.error('Error promoting to Co-CEO:', error);
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
