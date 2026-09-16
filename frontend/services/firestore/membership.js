import { db } from '@services/firebase/config';
import { errorHandler } from '@shared/utils/errorHandler';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ROLES } from '@shared/constants/roles';
import { NotificationsService } from './notifications';

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'];

function clean(value) {
  return String(value || '').trim();
}

export const MembershipService = {
  /**
   * Submit a membership application
   */
  async submitApplication(userId, data) {
    const application = {
      applicantId: userId,
      applicantName: clean(data.name),
      applicantEmail: clean(data.email),
      motivation: clean(data.motivation),
      skills: clean(data.skills),
      interests: clean(data.interests),
      experience: clean(data.experience),
      portfolioLinks: clean(data.portfolioLinks),
      status: 'pending',
      reviewedBy: null,
      reviewNotes: '',
      submittedAt: serverTimestamp(),
      reviewedAt: null,
    };

    if (!application.applicantName || !application.motivation) {
      throw new Error('Name and motivation are required.');
    }

    try {
      const docRef = await addDoc(collection(db, 'membershipApplications'), application);
      return docRef.id;
    } catch (err) {
      errorHandler.error(err, 'Submit Membership Application', { userId });
      throw err;
    }
  },

  /**
   * Get user's current membership application
   */
  async getUserApplication(userId) {
    const q = query(
      collection(db, 'membershipApplications'),
      where('applicantId', '==', userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    // Return the most recent application by submittedAt
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => {
      const aTime = a.submittedAt?.toMillis?.() || 0;
      const bTime = b.submittedAt?.toMillis?.() || 0;
      return bTime - aTime;
    })[0];
  },

  /**
   * Get all applications (for admin)
   */
  async getApplications(statusFilter = null) {
    let q = collection(db, 'membershipApplications');
    
    if (statusFilter) {
      q = query(
        collection(db, 'membershipApplications'),
        where('status', '==', statusFilter)
      );
    }

    const snap = await getDocs(q);
    const docs = snap.docs.map(item => ({ id: item.id, ...item.data() }));
    // Sort client-side by submittedAt
    return docs.sort((a, b) => {
      const aTime = a.submittedAt?.toMillis?.() || 0;
      const bTime = b.submittedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  },

  /**
   * Review and approve/reject application
   */
  async reviewApplication(applicationId, { status, reviewerId, reviewNotes = '' }) {
    const applicationRef = doc(db, 'membershipApplications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Application not found');
    }

    const application = applicationSnap.data();

    // Update application status
    await updateDoc(applicationRef, {
      status,
      reviewedBy: reviewerId,
      reviewNotes: clean(reviewNotes),
      reviewedAt: serverTimestamp(),
    });

    // If approved, update user role and membership status
    if (status === 'approved' && application.applicantId) {
      const userRef = doc(db, 'users', application.applicantId);
      const publicProfileRef = doc(db, 'publicProfiles', application.applicantId);
      
      const batch = writeBatch(db);
      batch.update(userRef, {
        role: ROLES.MEMBER,
        membershipStatus: 'approved',
      });
      batch.update(publicProfileRef, {
        role: ROLES.MEMBER,
        membershipStatus: 'approved',
      });
      await batch.commit();

      // 1. Direct notification to applicant
      try {
        await NotificationsService.createNotification({
          title: '🎉 Membership Application Approved!',
          message: `Congratulations! Your application has been approved.${reviewNotes ? ` Review notes: "${reviewNotes}"` : ' Welcome to the BeastBuck family as an official Member!'}.`,
          type: 'member_join',
          category: 'personal',
          actorName: 'Membership Board',
          actorUid: reviewerId,
          targetUid: application.applicantId,
          link: '/dashboard',
          isPublic: false,
          isPrivate: true,
        });

        // 2. Public announcement to all members
        await NotificationsService.createNotification({
          title: '👋 Welcome New Member!',
          message: `${application.applicantName || 'A new member'} has officially joined BeastBuck! Give them a warm welcome!`,
          type: 'member_join',
          category: 'public',
          actorName: 'BeastBuck',
          actorUid: reviewerId,
          link: `/portfolio/${application.applicantId}`,
          isPublic: true,
          isPrivate: false,
        });
      } catch (notifErr) {
        console.warn('Membership approval notification failed:', notifErr);
      }
    } else if (status === 'rejected' && application.applicantId) {
      // Direct notification to applicant with rejection reason
      try {
        await NotificationsService.createNotification({
          title: '📋 Membership Application Update',
          message: `Your membership application was reviewed and not accepted at this time.${reviewNotes ? ` Reason / Feedback: "${reviewNotes}"` : ''}`,
          type: 'member_update',
          category: 'personal',
          actorName: 'Membership Board',
          actorUid: reviewerId,
          targetUid: application.applicantId,
          link: '/membership',
          isPublic: false,
          isPrivate: true,
        });
      } catch (notifErr) {
        console.warn('Membership rejection notification failed:', notifErr);
      }
    }

    return true;
  },

  /**
   * Check if user is an approved member
   */
  async isApprovedMember(userId) {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;
    const userData = snap.data();

    // Check if account is actively suspended
    if (userData.suspended || userData.accountStatus === 'suspended') {
      if (userData.suspendedUntil) {
        const untilMs = userData.suspendedUntil?.toMillis 
          ? userData.suspendedUntil.toMillis() 
          : (typeof userData.suspendedUntil === 'number' ? userData.suspendedUntil : new Date(userData.suspendedUntil).getTime());
        if (!isNaN(untilMs) && untilMs > Date.now()) {
          return false;
        }
      } else {
        return false;
      }
    }

    if (userData.membershipStatus === 'approved') return true;
    if (userData.role) {
      const normalized = userData.role.toLowerCase().trim();
      return ['main ceo', 'co-ceo', 'co ceo', 'leader', 'moderator', 'mentor', 'judge', 'writer', 'member'].includes(normalized);
    }
    return false;
  },
};
