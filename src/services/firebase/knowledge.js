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
  increment,
  addDoc
} from 'firebase/firestore';
import { GamificationService } from './gamification';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const KnowledgeService = {
  // ---------------------------------------------------------------------------
  // SEARCH INDEX (For future Semantic Search & Global Retrieval)
  // ---------------------------------------------------------------------------
  async indexEntity(id, type, title, content, tags = [], authorId = null) {
    const ref = doc(db, 'searchIndex', id);
    // Minimal indexing logic for now; allows future AI embeddings
    await setDoc(ref, {
      type,
      title,
      contentSnippet: content ? content.substring(0, 500) : '',
      tags,
      authorId,
      indexedAt: serverTimestamp(),
    }, { merge: true });
  },

  // ---------------------------------------------------------------------------
  // ARTICLES
  // ---------------------------------------------------------------------------
  async getArticles({ category, authorId, featured, limitCount = 50 } = {}) {
    let q = query(collection(db, 'knowledgeArticles'), where('status', '==', 'PUBLISHED'));
    if (category) q = query(q, where('category', '==', category));
    if (authorId) q = query(q, where('authorId', '==', authorId));
    if (featured !== undefined) q = query(q, where('featured', '==', featured));
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getTrendingArticles(limitCount = 5) {
    // Basic approximation: sort by views.
    const q = query(collection(db, 'knowledgeArticles'), where('status', '==', 'PUBLISHED'), orderBy('views', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getRecommendedArticles(userId, limitCount = 5) {
    // Real implementation would use user's preferences. For now, fetch recent published.
    const q = query(collection(db, 'knowledgeArticles'), where('status', '==', 'PUBLISHED'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    // Shuffle the results slightly to mimic AI recommendation randomness
    const results = docsFrom(snap);
    return results.sort(() => 0.5 - Math.random());
  },

  async getPendingArticles(limitCount = 50) {
    const q = query(collection(db, 'knowledgeArticles'), where('status', '==', 'DRAFT'), limit(limitCount));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getArticle(articleId) {
    const snap = await getDoc(doc(db, 'knowledgeArticles', articleId));
    if (!snap.exists()) throw new Error('Article not found');
    
    // Increment views safely using Firebase increment
    const ref = doc(db, 'knowledgeArticles', articleId);
    await updateDoc(ref, { views: increment(1) });
    
    return { id: snap.id, ...snap.data() };
  },

  async publishArticle(data, userId) {
    const ref = doc(collection(db, 'knowledgeArticles'));
    await setDoc(ref, {
      ...data,
      authorId: userId,
      status: 'PUBLISHED',
      views: 0,
      likes: [],
      references: 0,
      featured: false,
      versions: [
        { version: 1, text: data.content, timestamp: new Date().toISOString(), authorId: userId }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Index for search
    await this.indexEntity(ref.id, 'knowledgeArticle', data.title, data.content, data.tags, userId);

    // Reward for knowledge sharing
    await GamificationService.awardXP({
      uid: userId,
      amount: 100,
      reason: `Published knowledge article: ${data.title}`,
      sourceType: 'KNOWLEDGE_PUBLISHED',
      sourceId: ref.id,
      actorId: 'SYSTEM'
    });

    await updateDoc(doc(db, 'users', userId), {
      'stats.knowledgeScore': increment(10),
      'stats.articlesPublished': increment(1)
    });

    return ref.id;
  },

  async updateArticle(articleId, data, userId) {
    const ref = doc(db, 'knowledgeArticles', articleId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    // In a real implementation, we would append to versions array
    await this.indexEntity(articleId, 'knowledgeArticle', data.title, data.content, data.tags, userId);
  },

  // ---------------------------------------------------------------------------
  // SMART COLLECTIONS
  // ---------------------------------------------------------------------------
  async getCollections(limitCount = 10) {
    const q = query(collection(db, 'knowledgeCollections'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async createCollection(data, userId) {
    const ref = await addDoc(collection(db, 'knowledgeCollections'), {
      ...data,
      creatorId: userId,
      itemCount: 0,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  // ---------------------------------------------------------------------------
  // KNOWLEDGE REQUESTS (Q&A)
  // ---------------------------------------------------------------------------
  async getRequests(limitCount = 20) {
    const q = query(collection(db, 'knowledgeRequests'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async submitRequest(data, userId) {
    const ref = await addDoc(collection(db, 'knowledgeRequests'), {
      ...data,
      authorId: userId,
      status: 'OPEN',
      answersCount: 0,
      createdAt: serverTimestamp(),
    });

    // Index for search
    await this.indexEntity(ref.id, 'knowledgeRequest', data.title, data.description, data.tags, userId);

    return ref.id;
  }
};
