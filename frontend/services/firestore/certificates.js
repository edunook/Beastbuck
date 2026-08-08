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
  serverTimestamp,
} from 'firebase/firestore';
// Use a secure, readable alphabet for verification codes
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function generateVerificationCode(length = 12) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
}

function generateCertNumber(length = 8) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const CertificateService = {
  /**
   * Issues a new certificate to a user, ensuring duplicates are avoided.
   * @param {Object} data { userId, type, title, description, actorId, metadata }
   * @returns {string} certificateId
   */
  async issueCertificate({ userId, type, title, description, actorId, metadata = {} }) {
    if (!userId || !type || !title) throw new Error('Missing required certificate fields');

    // Prevent duplicate active certificates of the same title/type for the user
    const existingSnap = await getDocs(
      query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('status', '==', 'ACTIVE')
      )
    );
    
    // Filter by title client-side to avoid composite index
    const existingByTitle = existingSnap.docs.filter(doc => doc.data().title === title);

    if (existingByTitle.length > 0) {
      return existingByTitle[0].id;
    }

    const certRef = doc(collection(db, 'certificates'));
    const verificationCode = generateVerificationCode();
    const certificateNumber = `BB-${new Date().getFullYear()}-${generateCertNumber()}`;
    const publicUrl = `${window.location.origin}/verify/${certRef.id}`;

    await setDoc(certRef, {
      userId,
      type,
      title,
      description,
      status: 'ACTIVE',
      verificationCode,
      certificateNumber,
      publicUrl,
      metadata,
      issuedBy: actorId || 'SYSTEM',
      issuedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return certRef.id;
  },

  async verifyCertificate(certId) {
    if (!certId) return null;
    const snap = await getDoc(doc(db, 'certificates', certId));
    if (!snap.exists()) return null;
    
    const cert = { id: snap.id, ...snap.data() };
    
    // Fetch user details for display
    const userSnap = await getDoc(doc(db, 'users', cert.userId));
    if (userSnap.exists()) {
      cert.user = userSnap.data();
    }
    
    return cert;
  },

  async revokeCertificate(certId, actorId) {
    await updateDoc(doc(db, 'certificates', certId), {
      status: 'REVOKED',
      revokedAt: serverTimestamp(),
      revokedBy: actorId,
    });
  },

  async getUserCertificates(userId) {
    const snap = await getDocs(
      query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('status', '==', 'ACTIVE')
      )
    );
    return docsFrom(snap).sort((a, b) => {
      const aTime = a.issuedAt?.toMillis?.() || 0;
      const bTime = b.issuedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  },

  async getAvailableCertificates() {
    const snap = await getDocs(
      query(
        collection(db, 'certificatePrograms'),
        where('status', '==', 'PUBLISHED')
      )
    );
    return docsFrom(snap).sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  },

  async getInProgressCertificates(userId) {
    const snap = await getDocs(
      query(
        collection(db, 'certificateProgress'),
        where('userId', '==', userId),
        where('status', '==', 'IN_PROGRESS')
      )
    );
    return docsFrom(snap).sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }
};
