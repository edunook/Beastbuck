import { db } from './config';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { GamificationService, XP_REWARD_TYPES } from './gamification';

export const EXPERIMENT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ARCHIVED'];
export const EXPERIMENT_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
export const EXPERIMENT_CATEGORIES = [
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Coding',
  'AI',
  'Environment',
  'Invention',
];

const CREATE_EXPERIMENT_XP = 75;

function experimentsRef() {
  return collection(db, 'experiments');
}

function experimentRef(experimentId) {
  return doc(db, 'experiments', experimentId);
}

function commentsRef(experimentId) {
  return collection(db, 'experiments', experimentId, 'comments');
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeExperiment(data) {
  return {
    title: normalizeText(data.title),
    description: normalizeText(data.description),
    category: data.category || 'Invention',
    difficulty: data.difficulty || 'Beginner',
    status: data.status || 'PLANNING',
    teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
    media: Array.isArray(data.media) ? data.media : [],
    materials: normalizeText(data.materials),
    procedure: normalizeText(data.procedure),
    results: normalizeText(data.results),
    lessonsLearned: normalizeText(data.lessonsLearned),
  };
}

function searchableText(experiment) {
  return [
    experiment.title,
    experiment.description,
    experiment.category,
    experiment.difficulty,
    experiment.status,
  ].join(' ').toLowerCase();
}

export const ExperimentsService = {
  async createExperiment(data, author) {
    const experiment = normalizeExperiment(data);

    if (!experiment.title || !experiment.description) {
      throw new Error('Experiment title and description are required.');
    }

    const docRef = await addDoc(experimentsRef(), {
      ...experiment,
      authorId: author.uid,
      authorName: author.name,
      authorUsername: author.username,
      likes: [],
      views: 0,
      featured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await GamificationService.awardXP({
      uid: author.uid,
      amount: CREATE_EXPERIMENT_XP,
      reason: `Experiment created: ${experiment.title}`,
      sourceType: XP_REWARD_TYPES.EXPERIMENT,
      sourceId: docRef.id,
      actorId: author.uid,
      metadata: { category: experiment.category },
    });

    return docRef.id;
  },

  async updateExperiment(experimentId, data) {
    await updateDoc(experimentRef(experimentId), {
      ...normalizeExperiment(data),
      updatedAt: serverTimestamp(),
    });
  },

  async deleteExperiment(experimentId) {
    await deleteDoc(experimentRef(experimentId));
  },

  async archiveExperiment(experimentId) {
    await updateDoc(experimentRef(experimentId), {
      status: 'ARCHIVED',
      updatedAt: serverTimestamp(),
    });
  },

  async featureExperiment(experimentId, featured) {
    await updateDoc(experimentRef(experimentId), {
      featured,
      updatedAt: serverTimestamp(),
    });
  },

  async getExperiment(experimentId) {
    const snap = await getDoc(experimentRef(experimentId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async incrementViews(experimentId) {
    await updateDoc(experimentRef(experimentId), {
      views: increment(1),
    });
  },

  async toggleLike(experimentId, uid, hasLiked) {
    await updateDoc(experimentRef(experimentId), {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  },

  subscribeToExperiment(experimentId, { onExperiment, onError }) {
    return onSnapshot(
      experimentRef(experimentId),
      (snap) => onExperiment(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (error) => onError?.(error),
    );
  },

  async searchExperiments(filters = {}) {
    const q = query(experimentsRef(), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const search = normalizeText(filters.search).toLowerCase();

    return snap.docs
      .map(experimentDoc => ({ id: experimentDoc.id, ...experimentDoc.data() }))
      .filter(experiment => experiment.status !== 'ARCHIVED' || filters.includeArchived)
      .filter(experiment => !search || searchableText(experiment).includes(search))
      .filter(experiment => !filters.category || experiment.category === filters.category)
      .filter(experiment => !filters.status || experiment.status === filters.status)
      .filter(experiment => !filters.creatorId || experiment.authorId === filters.creatorId);
  },

  subscribeToComments(experimentId, { onComments, onError }) {
    const q = query(commentsRef(experimentId), orderBy('createdAt', 'asc'), limit(100));
    return onSnapshot(
      q,
      (snap) => onComments(snap.docs.map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }))),
      (error) => onError?.(error),
    );
  },

  async addComment(experimentId, { authorId, authorName, text }) {
    const cleanText = normalizeText(text);
    if (!cleanText) throw new Error('Comment cannot be empty.');

    await addDoc(commentsRef(experimentId), {
      authorId,
      authorName,
      text: cleanText,
      createdAt: serverTimestamp(),
    });
  },

  async deleteComment(experimentId, commentId) {
    await deleteDoc(doc(db, 'experiments', experimentId, 'comments', commentId));
  },

  async getCreators() {
    const q = query(experimentsRef(), limit(100));
    const snap = await getDocs(q);
    const creators = new Map();

    for (const experimentDoc of snap.docs) {
      const experiment = experimentDoc.data();
      if (experiment.authorId && experiment.status !== 'ARCHIVED') {
        creators.set(experiment.authorId, {
          id: experiment.authorId,
          name: experiment.authorName || experiment.authorUsername || 'Member',
        });
      }
    }

    return [...creators.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
};
