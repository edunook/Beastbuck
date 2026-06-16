import { db } from './config';
import { collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';

const THEMES_COLLECTION = 'themes';

export const ThemesService = {
  /**
   * Create a new custom theme
   */
  async createTheme(themeData) {
    try {
      const docRef = await addDoc(collection(db, THEMES_COLLECTION), {
        ...themeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...themeData };
    } catch (error) {
      // Silently fail - theme won't be saved to Firestore without proper rules
      throw error; // Re-throw to allow fallback in UI
    }
  },

  /**
   * Get a theme by ID
   */
  async getThemeById(themeId) {
    try {
      const docRef = doc(db, THEMES_COLLECTION, themeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting theme:', error);
      throw error;
    }
  },

  /**
   * Get all public themes
   */
  async getPublicThemes() {
    try {
      const q = query(
        collection(db, THEMES_COLLECTION),
        where('isPublic', '==', true),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      console.log('Public themes query result:', querySnapshot.docs.length, 'documents');
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting public themes:', error);
      // Silently fail - public themes won't be available without proper Firestore rules
      return [];
    }
  },

  /**
   * Get themes created by a specific user
   */
  async getUserThemes(userId) {
    try {
      const q = query(
        collection(db, THEMES_COLLECTION),
        where('createdBy', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      console.log('User themes query result for userId:', userId, '-', querySnapshot.docs.length, 'documents');
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user themes:', error);
      // Silently fail - user themes won't be available without proper Firestore rules
      return [];
    }
  },

  /**
   * Update a theme
   */
  async updateTheme(themeId, updates) {
    try {
      const docRef = doc(db, THEMES_COLLECTION, themeId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  },

  /**
   * Delete a theme
   */
  async deleteTheme(themeId) {
    try {
      const docRef = doc(db, THEMES_COLLECTION, themeId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  },
};
