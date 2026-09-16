import { db } from '@services/firebase/config';
import {
  addDoc,
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
  where,
} from 'firebase/firestore';
import { GamificationService, XP_REWARD_TYPES } from './gamification';
import { NotificationsService } from './notifications';

const UPLOAD_VIDEO_XP = 25;

function funflixVideosRef() {
  return collection(db, 'funflix_videos');
}

function funflixVideoRef(videoId) {
  return doc(db, 'funflix_videos', videoId);
}

function funflixCommentsRef(videoId) {
  return collection(db, 'funflix_videos', videoId, 'comments');
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

    // Notify all members if public video
    try {
      if (data.visibility !== 'private') {
        await NotificationsService.createNotification({
          title: '🎬 New FunFlix Video!',
          message: `${creator.name || creator.username || 'A member'} just uploaded a new video: "${video.title}". Watch it on FunFlix!`,
          type: 'funflix',
          category: 'public',
          actorName: creator.name || creator.username || 'FunFlix Creator',
          actorUid: creator.uid,
          link: `/funflix?video=${docRef.id}`,
          isPublic: true,
          isPrivate: false,
        });
      }
    } catch (notifErr) {
      console.warn('FunFlix public notification failed:', notifErr);
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
    if (!videoId || !uid) throw new Error('Video ID and User ID are required to like');
    await updateDoc(funflixVideoRef(videoId), {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
      likeCount: increment(hasLiked ? -1 : 1),
      updatedAt: serverTimestamp(),
    });
  },

  subscribeToVideo(videoId, { onVideo, onError }) {
    return onSnapshot(
      funflixVideoRef(videoId),
      (snap) => onVideo(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (error) => onError?.(error),
    );
  },

  subscribeToComments(videoId, { onComments, onError }) {
    const q = query(funflixCommentsRef(videoId), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => onComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (error) => onError?.(error),
    );
  },

  async addComment(videoId, { text, user }) {
    const cleanText = clean(text);
    if (!cleanText) throw new Error('Comment cannot be empty');

    const docRef = await addDoc(funflixCommentsRef(videoId), {
      text: cleanText,
      userId: user.uid,
      userName: user.displayName || user.name || user.username || 'Member',
      userAvatar: user.photoURL || null,
      userRole: user.role || 'Member',
      likes: [],
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async deleteComment(videoId, commentId) {
    await deleteDoc(doc(db, 'funflix_videos', videoId, 'comments', commentId));
  },

  async getRelatedVideos(currentVideoId, category = '', maxLimit = 8) {
    try {
      const snap = await getDocs(query(funflixVideosRef(), limit(30)));
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => v.id !== currentVideoId);

      // Prioritize same category, then views
      const sameCategory = all.filter(v => category && v.category === category);
      const others = all.filter(v => !category || v.category !== category);

      return [...sameCategory, ...others].slice(0, maxLimit);
    } catch (err) {
      console.warn('Failed fetching related videos:', err);
      return [];
    }
  },
};
