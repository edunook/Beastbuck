import { db } from './config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const KnowledgeGraphService = {
  // ---------------------------------------------------------------------------
  // GRAPH RELATIONS
  // ---------------------------------------------------------------------------
  async linkEntities(sourceId, targetId, relationType) {
    const relationId = `${sourceId}_${targetId}_${relationType}`;
    const ref = doc(db, 'knowledgeRelations', relationId);
    await setDoc(ref, {
      sourceId,
      targetId,
      relationType, // e.g. "REFERENCES", "INSPIRED_BY", "DEVELOPED_BY", "TAUGHT_IN"
      createdAt: serverTimestamp()
    }, { merge: true });
  },

  async getRelationsForEntity(entityId) {
    const qSource = query(collection(db, 'knowledgeRelations'), where('sourceId', '==', entityId));
    const snapSource = await getDocs(qSource);
    
    const qTarget = query(collection(db, 'knowledgeRelations'), where('targetId', '==', entityId));
    const snapTarget = await getDocs(qTarget);

    return [...docsFrom(snapSource), ...docsFrom(snapTarget)];
  }
};
