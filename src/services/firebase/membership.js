import { db } from './config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ROLES } from '../../constants/roles';

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

    const docRef = await addDoc(collection(db, 'membershipApplications'), application);
    return docRef.id;
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
    return userData.membershipStatus === 'approved' && userData.role === ROLES.MEMBER;
  },
};
