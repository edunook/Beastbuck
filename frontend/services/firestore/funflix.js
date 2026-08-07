import { db } from '@services/firebase/config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { GamificationService, XP_REWARD_TYPES } from './gamification';

const UPLOAD_VIDEO_XP = 25;

function funflixVideosRef() {
  return collection(db, 'funflix_videos');
}

function funflixVideoRef(videoId) {
  return doc(db, 'funflix_videos', videoId);
}

function clean(value) {
  return String(value || '').trim();
}

export const FunFlixService = {
  async createVideo(data, creator) {
    const video = {
      title: clean(data.title),
      description: clean(data.description || ''),
      category: data.category || 'Comedy Skit',
      videoUrl: data.videoUrl,
      thumbnail: data.thumbnail || '',  // Always store as string, never null
      duration: data.duration || 0,
    };

    if (!video.title || !video.videoUrl) {
      throw new Error('Video title and URL are required.');
    }

    const docRef = await addDoc(funflixVideosRef(), {
      ...video,
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      likes: [],
      views: 0,
      featured: false,
      status: 'PUBLISHED',
      tags: data.tags || [],
      visibility: data.visibility || 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await GamificationService.awardXP({
        uid: creator.uid,
        amount: UPLOAD_VIDEO_XP,
        reason: `FunFlix video uploaded: ${video.title}`,
        sourceType: XP_REWARD_TYPES.PRODUCT,
        sourceId: docRef.id,
        actorId: creator.uid,
        metadata: { category: video.category },
      });
    } catch (xpErr) {
      console.warn('XP awarding skipped or failed:', xpErr);
    }

    return docRef.id;
  },

  async getVideo(videoId) {
    if (!videoId) {
      throw new Error('Video ID is required');
    }
    const snap = await getDoc(funflixVideoRef(videoId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  async incrementViews(videoId) {
    await updateDoc(funflixVideoRef(videoId), {
      views: increment(1),
    });
  },

  async toggleLike(videoId, uid, hasLiked) {
    await updateDoc(funflixVideoRef(videoId), {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  },
};
