import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const InnovationService = {
  // ----------------------------------------
  // RESEARCH LOGS (Innovation Journal)
  // ----------------------------------------
  async addResearchLog(projectId, { title, observations, notes, mediaUrls, authorId }) {
    const logRef = await addDoc(collection(db, 'researchLogs'), {
      projectId,
      title,
      observations,
      notes,
      mediaUrls: mediaUrls || [],
      authorId,
      timestamp: serverTimestamp(),
    });
    return logRef.id;
  },

  async getResearchLogs(projectId) {
    const snap = await getDocs(
      query(collection(db, 'researchLogs'), where('projectId', '==', projectId), orderBy('timestamp', 'desc'))
    );
    return docsFrom(snap);
  },

  // ----------------------------------------
  // DISCOVERIES
  // ----------------------------------------
  async createDiscovery({ projectId, title, description, evidence, authorId, collaborators }) {
    const discoveryRef = await addDoc(collection(db, 'discoveries'), {
      projectId,
      title,
      description,
      evidence,
      authorId,
      collaborators: collaborators || [],
      status: 'PENDING_REVIEW', // PENDING_REVIEW, APPROVED, FEATURED
      timestamp: serverTimestamp(),
    });
    return discoveryRef.id;
  },

  async getDiscoveries(filters = {}) {
    let q = collection(db, 'discoveries');
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.authorId) q = query(q, where('authorId', '==', filters.authorId));
    // Usually orderBy timestamp requires composite index if where is used, so we filter manually or just sort in memory if needed.
    const snap = await getDocs(q);
    return docsFrom(snap).sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
  },

  async approveDiscovery(discoveryId, actorId) {
    await updateDoc(doc(db, 'discoveries', discoveryId), {
      status: 'APPROVED',
      approvedBy: actorId,
      approvedAt: serverTimestamp(),
    });
  },

  async featureDiscovery(discoveryId, actorId) {
    await updateDoc(doc(db, 'discoveries', discoveryId), {
      status: 'FEATURED',
      featuredBy: actorId,
      featuredAt: serverTimestamp(),
    });
  },

  // ----------------------------------------
  // SHOWCASE AGGREGATION
  // ----------------------------------------
  async getInnovationShowcase() {
    // Fetch featured/approved discoveries
    const discoveries = await this.getDiscoveries({ status: 'FEATURED' });
    
    // Fetch RESEARCH, INVENTION, PROTOTYPE projects
    const projectsSnap = await getDocs(query(
      collection(db, 'projects'),
      where('projectType', 'in', ['RESEARCH', 'INVENTION', 'PROTOTYPE'])
    ));
    const innovationProjects = docsFrom(projectsSnap);

    return {
      discoveries,
      research: innovationProjects.filter(p => p.projectType === 'RESEARCH'),
      inventions: innovationProjects.filter(p => p.projectType === 'INVENTION'),
      prototypes: innovationProjects.filter(p => p.projectType === 'PROTOTYPE'),
    };
  }
};
