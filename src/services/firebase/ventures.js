import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const VentureVisibility = {
  PRIVATE: 'PRIVATE',
  TEAM_ONLY: 'TEAM_ONLY',
  ORGANIZATION_VISIBLE: 'ORGANIZATION_VISIBLE',
  PUBLIC_SHOWCASE: 'PUBLIC_SHOWCASE'
};

export const VentureLifecycle = {
  IDEA: 'IDEA',
  RESEARCH: 'RESEARCH',
  VALIDATION: 'VALIDATION',
  PROTOTYPE: 'PROTOTYPE',
  MVP: 'MVP',
  TESTING: 'TESTING',
  EARLY_USERS: 'EARLY_USERS',
  GROWTH: 'GROWTH',
  SCALING: 'SCALING',
  ENTERPRISE: 'ENTERPRISE',
  GLOBAL: 'GLOBAL',
  LEGACY: 'LEGACY'
};

export const VenturesService = {
  // ---------------------------------------------------------------------------
  // VENTURE CREATION & MANAGEMENT
  // ---------------------------------------------------------------------------
  async createVenture(data, founderId) {
    const ref = await addDoc(collection(db, 'ventures'), {
      ...data,
      founderId,
      visibility: VentureVisibility.PRIVATE,
      lifecycleStage: VentureLifecycle.IDEA,
      healthScore: 100, // starting point
      fundingSimulation: {
        reputationFunding: 0,
        innovationGrants: 0,
        ventureScoreFunding: 0,
        totalSimulatedValue: 0
      },
      stats: {
        membersCount: 1,
        projectsCount: 0,
        productsCount: 0,
        researchLinksCount: 0,
        inventionLinksCount: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also add the founder as the first member with Owner role
    await addDoc(collection(db, 'ventureMembers'), {
      ventureId: ref.id,
      userId: founderId,
      role: 'FOUNDER',
      joinedAt: serverTimestamp()
    });

    return ref.id;
  },

  async getVenture(ventureId) {
    const snap = await getDoc(doc(db, 'ventures', ventureId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  async getVenturesByVisibility(visibilityLevels, limitCount = 20) {
    const q = query(
      collection(db, 'ventures'),
      where('visibility', 'in', visibilityLevels),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getVenturesByLifecycle(stage, limitCount = 20) {
    const q = query(
      collection(db, 'ventures'),
      where('lifecycleStage', '==', stage),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  // Update visibility (Requires admin/leadership approval for PUBLIC)
  async updateVisibility(ventureId, visibility) {
    const ref = doc(db, 'ventures', ventureId);
    await updateDoc(ref, {
      visibility,
      updatedAt: serverTimestamp()
    });
  },

  // Update lifecycle stage
  async updateLifecycleStage(ventureId, stage) {
    const ref = doc(db, 'ventures', ventureId);
    await updateDoc(ref, {
      lifecycleStage: stage,
      updatedAt: serverTimestamp()
    });
  },

  // ---------------------------------------------------------------------------
  // VENTURE LINKS (Research, Inventions, etc.)
  // ---------------------------------------------------------------------------
  async linkEntityToVenture(ventureId, entityType, entityId, metadata = {}) {
    // entityType: 'RESEARCH', 'INVENTION', 'PRODUCT', 'PROJECT'
    const linkRef = doc(db, 'ventureLinks', `${ventureId}_${entityType}_${entityId}`);
    await setDoc(linkRef, {
      ventureId,
      entityType,
      entityId,
      metadata,
      linkedAt: serverTimestamp()
    }, { merge: true });
    
    // In a real implementation we would increment the stats safely in the parent venture document
  }
};
