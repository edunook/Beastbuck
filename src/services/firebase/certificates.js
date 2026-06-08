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
        where('title', '==', title),
        where('status', '==', 'ACTIVE')
      )
    );

    if (!existingSnap.empty) {
      console.log(`Certificate "${title}" already exists and is active for user ${userId}`);
      return existingSnap.docs[0].id;
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
        where('status', '==', 'ACTIVE'),
        orderBy('issuedAt', 'desc')
      )
    );
    return docsFrom(snap);
  },

  async getAvailableCertificates() {
    const snap = await getDocs(
      query(
        collection(db, 'certificatePrograms'),
        where('status', '==', 'PUBLISHED'),
        orderBy('title', 'asc')
      )
    );
    return docsFrom(snap);
  },

  async getInProgressCertificates(userId) {
    const snap = await getDocs(
      query(
        collection(db, 'certificateProgress'),
        where('userId', '==', userId),
        where('status', '==', 'IN_PROGRESS'),
        orderBy('updatedAt', 'desc')
      )
    );
    return docsFrom(snap);
  }
};
