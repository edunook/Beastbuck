import { db } from './config';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

function mapDocs(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const PublicDataService = {
  async getExperiments(maxCount = 24) {
    const snap = await getDocs(query(collection(db, 'experiments'), orderBy('createdAt', 'desc'), limit(maxCount)));
    return mapDocs(snap).filter(item => item.status !== 'ARCHIVED');
  },

  async getProducts(maxCount = 24) {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(maxCount)));
    return mapDocs(snap).filter(item => item.status !== 'ARCHIVED' && item.status !== 'DRAFT');
  },

  async getProjects(maxCount = 24) {
    const snap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(maxCount)));
    return mapDocs(snap).filter(item => item.status !== 'ARCHIVED');
  },

  async getHallOfFame(maxCount = 50) {
    const snap = await getDocs(query(collection(db, 'publicProfiles'), orderBy('xp', 'desc'), limit(maxCount)));
    return mapDocs(snap);
  },

  async getPublicProfile(uid) {
    const snap = await getDoc(doc(db, 'publicProfiles', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getProfileContent(uid) {
    const [experimentsSnap, productsSnap, projectsSnap] = await Promise.all([
      getDocs(query(collection(db, 'experiments'), where('authorId', '==', uid), limit(20))),
      getDocs(query(collection(db, 'products'), where('creatorId', '==', uid), limit(20))),
      getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid), limit(20))),
    ]);

    return {
      experiments: mapDocs(experimentsSnap).filter(item => item.status !== 'ARCHIVED'),
      products: mapDocs(productsSnap).filter(item => item.status !== 'ARCHIVED' && item.status !== 'DRAFT'),
      projects: mapDocs(projectsSnap).filter(item => item.status !== 'ARCHIVED'),
    };
  },
};
