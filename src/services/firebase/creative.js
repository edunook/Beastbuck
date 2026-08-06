import { db } from './config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { GamificationService, XP_REWARD_TYPES } from './gamification';

export const CREATIVE_CATEGORIES = [
  'Drawing',
  'Craft',
  'Model',
  'Poster',
  'Design',
  'Digital Art',
  'Photography',
  'Sculpture',
];

export const CREATIVE_STATUSES = ['DRAFT', 'SHOWCASE', 'AVAILABLE', 'SOLD_OUT', 'ARCHIVED'];

const CREATE_CREATIVE_XP = 50;

function creativeWorksRef() {
  return collection(db, 'creative_works');
}

function creativeWorkRef(workId) {
  return doc(db, 'creative_works', workId);
}

function commentsRef(workId) {
  return collection(db, 'creative_works', workId, 'comments');
}

function clean(value) {
  return String(value || '').trim();
}

function normalizeCreativeWork(data) {
  return {
    title: clean(data.title),
    description: clean(data.description),
    category: data.category || 'Drawing',
    media: Array.isArray(data.media) ? data.media : [],
    status: data.status || 'PUBLISHED',
  };
}

function searchableText(work) {
  return [
    work.title,
    work.description,
    work.category,
    work.status,
    work.creatorName,
    work.creatorUsername,
  ].join(' ').toLowerCase();
}

function sortCreativeWorks(works, sort = 'newest') {
  return [...works].sort((a, b) => {
    if (sort === 'popular') return (b.likes?.length || 0) - (a.likes?.length || 0);
    if (sort === 'views') return Number(b.views || 0) - Number(a.views || 0);
    return Number(b.createdAt?.seconds || 0) - Number(a.createdAt?.seconds || 0);
  });
}

export const CreativeService = {
  async createCreativeWork(data, creator) {
    const work = normalizeCreativeWork(data);

    if (!work.title) {
      throw new Error('Creative work title is required.');
    }

    const docRef = await addDoc(creativeWorksRef(), {
      ...work,
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      likes: [],
      views: 0,
      featured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await GamificationService.awardXP({
      uid: creator.uid,
      amount: CREATE_CREATIVE_XP,
      reason: `Creative work created: ${work.title}`,
      sourceType: XP_REWARD_TYPES.PRODUCT, // Reuse PRODUCT type for creative works
      sourceId: docRef.id,
      actorId: creator.uid,
      metadata: { category: work.category },
    });

    return docRef.id;
  },

  async updateCreativeWork(workId, data) {
    await updateDoc(creativeWorkRef(workId), {
      ...normalizeCreativeWork(data),
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCreativeWork(workId) {
    await deleteDoc(creativeWorkRef(workId));
  },

  async archiveCreativeWork(workId) {
    await updateDoc(creativeWorkRef(workId), {
      status: 'ARCHIVED',
      updatedAt: serverTimestamp(),
    });
  },

  async featureCreativeWork(workId, featured) {
    await updateDoc(creativeWorkRef(workId), {
      featured,
      updatedAt: serverTimestamp(),
    });
  },

  subscribeToCreativeWork(workId, { onWork, onError }) {
    return onSnapshot(
      creativeWorkRef(workId),
      (snap) => onWork(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (error) => onError?.(error),
    );
  },

  async incrementViews(workId) {
    await updateDoc(creativeWorkRef(workId), {
      views: increment(1),
    });
  },

  async toggleLike(workId, uid, hasLiked) {
    await updateDoc(creativeWorkRef(workId), {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  },

  async searchCreativeWorks(filters = {}) {
    const snap = await getDocs(query(creativeWorksRef(), orderBy('createdAt', 'desc'), limit(100)));
    const search = clean(filters.search).toLowerCase();

    const works = snap.docs
      .map(workDoc => ({ id: workDoc.id, ...workDoc.data() }))
      .filter(work => work.status !== 'ARCHIVED' || filters.includeArchived)
      .filter(work => !search || searchableText(work).includes(search))
      .filter(work => !filters.category || work.category === filters.category)
      .filter(work => !filters.status || work.status === filters.status)
      .filter(work => !filters.creatorId || work.creatorId === filters.creatorId);

    return sortCreativeWorks(works, filters.sort);
  },

  subscribeToComments(workId, { onComments, onError }) {
    const q = query(commentsRef(workId), orderBy('createdAt', 'asc'), limit(100));
    return onSnapshot(
      q,
      (snap) => onComments(snap.docs.map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }))),
      (error) => onError?.(error),
    );
  },

  async addComment(workId, { authorId, authorName, text }) {
    const cleanText = clean(text);
    if (!cleanText) throw new Error('Comment cannot be empty.');

    await addDoc(commentsRef(workId), {
      authorId,
      authorName,
      text: cleanText,
      createdAt: serverTimestamp(),
    });
  },

  async deleteComment(workId, commentId) {
    await deleteDoc(doc(db, 'creative_works', workId, 'comments', commentId));
  },

  async getCreators() {
    const snap = await getDocs(query(creativeWorksRef(), limit(100)));
    const creators = new Map();

    for (const workDoc of snap.docs) {
      const work = workDoc.data();
      if (work.creatorId && work.status !== 'ARCHIVED') {
        creators.set(work.creatorId, {
          id: work.creatorId,
          name: work.creatorName || work.creatorUsername || 'Member',
        });
      }
    }

    return [...creators.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
};
