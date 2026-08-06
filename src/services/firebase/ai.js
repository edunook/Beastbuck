import { db } from './config';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
  orderBy,
} from 'firebase/firestore';

export const AIService = {
  async sendMessage({ message }) {
    const docRef = await addDoc(collection(db, 'aiConversations'), {
      message,
      createdAt: serverTimestamp(),
    });

    return {
      text: 'I\'m here to help! Visit AI Studio to build and chat with AI assistants.',
      id: docRef.id,
    };
  },

  async getSuggestions() {
    return [
      { label: 'Build an AI', icon: '🤖' },
      { label: 'Get Ideas', icon: '💡' },
      { label: 'Explain a Topic', icon: '📖' },
      { label: 'Start Research', icon: '🧪' },
    ];
  },

  async getRecommendations(userId) {
    try {
      const snap = await getDocs(query(
        collection(db, 'users', userId, 'recommendations'),
        orderBy('createdAt', 'desc'),
        limit(5),
      ));

      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      return [
        { id: 1, type: 'ai', title: 'Build your first AI', description: 'Create an AI assistant in AI Studio' },
        { id: 2, type: 'research', title: 'Start a research project', description: 'Document your ideas in Research' },
        { id: 3, type: 'project', title: 'Join a project', description: 'Collaborate with your squad' },
        { id: 4, type: 'challenge', title: 'Take a challenge', description: 'Complete daily missions for XP' },
        { id: 5, type: 'community', title: 'Explore the community', description: 'Discover what others are building' },
      ];
    } catch (err) {
      console.log('AI recommendations failed:', err.message);
      return [];
    }
  },
};