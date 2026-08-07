import { db } from '@services/firebase/config';
import { collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import errorHandler from '@shared/utils/errorHandler';

const THEMES_COLLECTION = 'themes';

export const ThemesService = {
  /**
   * Create a new custom theme
   */
  async createTheme(themeData) {
    const docRef = await addDoc(collection(db, THEMES_COLLECTION), {
      ...themeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...themeData };
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
      errorHandler.error(error, 'Get Theme', { themeId });
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      errorHandler.warn('Public themes query failed, using empty fallback', 'Get Public Themes');
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      errorHandler.warn('User themes query failed, using empty fallback', 'Get User Themes', { userId });
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
      errorHandler.error(error, 'Update Theme', { themeId });
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
      errorHandler.error(error, 'Delete Theme', { themeId });
      throw error;
    }
  },
};
