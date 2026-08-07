import { db } from '@services/firebase/config';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Universal content service for managing diverse content types
 * (Products, Experiments, Skill Posts) to prevent logic duplication.
 */
export const ContentService = {
  
  /**
   * Create content in a specific collection
   * @param {'products' | 'experiments' | 'skillPosts'} collectionName 
   */
  async createContent(collectionName, data, authorId) {
    const collRef = collection(db, collectionName);
    const content = {
      ...data,
      authorId,
      metrics: { likes: 0, views: 0 },
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collRef, content);
    return docRef.id;
  },

  /**
   * Update existing content
   */
  async updateContent(collectionName, contentId, data) {
    const docRef = doc(db, collectionName, contentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Delete content
   */
  async deleteContent(collectionName, contentId) {
    const docRef = doc(db, collectionName, contentId);
    await deleteDoc(docRef);
  }
};
