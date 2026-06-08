import { db } from './config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

export const COMMUNITY_CATEGORIES = [
  'Programming',
  'Science',
  'Robotics',
  'AI',
  'Design',
  'Marketing',
  'Engineering',
  'Innovation',
  'Leadership',
];

export const DEFAULT_COMMUNITIES = COMMUNITY_CATEGORIES.map(name => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  description: `${name} discussions, projects, research, inventions, and collaboration.`,
  category: name,
  visibility: 'PUBLIC',
}));

export const REPUTATION_FIELDS = {
  contribution: 'contributionScore',
  knowledge: 'knowledgeScore',
  innovation: 'innovationScore',
  collaboration: 'collaborationScore',
};

function now() {
  return serverTimestamp();
}

function clean(value) {
  return String(value || '').trim();
}

function communityMemberId(communityId, userId) {
  return `${communityId}_${userId}`;
}

function followId(followerId, followingId) {
  return `${followerId}_${followingId}`;
}

function searchable(item) {
  return [
    item.title,
    item.content,
    item.description,
    item.category,
    item.type,
    item.authorName,
  ].join(' ').toLowerCase();
}

export const CommunityService = {
  async seedDefaultCommunities(actorId) {
    const batch = writeBatch(db);
    for (const community of DEFAULT_COMMUNITIES) {
      batch.set(doc(db, 'communities', community.id), {
        ...community,
        createdBy: actorId,
        memberCount: 0,
        postCount: 0,
        archived: false,
        createdAt: now(),
        updatedAt: now(),
      }, { merge: true });
    }
    await batch.commit();
  },

  async getCommunities() {
    let snap = await getDocs(query(collection(db, 'communities'), orderBy('memberCount', 'desc'), limit(50)));
    if (snap.empty) return DEFAULT_COMMUNITIES.map(item => ({ ...item, memberCount: 0, postCount: 0, archived: false }));
    return snap.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => !item.archived);
  },

  async getCommunity(communityId) {
    const snap = await getDoc(doc(db, 'communities', communityId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : DEFAULT_COMMUNITIES.find(item => item.id === communityId) || null;
  },

  async joinCommunity(community, member) {
    const batch = writeBatch(db);
    const communityRef = doc(db, 'communities', community.id);
    const memberRef = doc(db, 'communityMembers', communityMemberId(community.id, member.uid));

    batch.set(communityRef, {
      id: community.id,
      name: community.name,
      description: community.description,
      category: community.category,
      visibility: community.visibility || 'PUBLIC',
      memberCount: increment(1),
      postCount: community.postCount || 0,
      archived: false,
      updatedAt: now(),
      createdAt: community.createdAt || now(),
    }, { merge: true });
    batch.set(memberRef, {
      communityId: community.id,
      userId: member.uid,
      username: member.username,
      displayName: member.name,
      role: 'MEMBER',
      joinedAt: now(),
    }, { merge: true });
    batch.set(doc(collection(db, 'activityFeed')), {
      type: 'COMMUNITY_JOINED',
      category: 'Community',
      title: `${member.name} joined ${community.name}`,
      message: `${member.name} joined the ${community.name} community.`,
      actorId: member.uid,
      actorName: member.name,
      link: `/communities/${community.id}`,
      createdAt: now(),
    });
    await batch.commit();
  },

  async leaveCommunity(communityId, userId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'communityMembers', communityMemberId(communityId, userId)));
    batch.update(doc(db, 'communities', communityId), { memberCount: increment(-1), updatedAt: now() });
    await batch.commit();
  },

  async getMembership(communityId, userId) {
    if (!communityId || !userId) return null;
    const snap = await getDoc(doc(db, 'communityMembers', communityMemberId(communityId, userId)));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getCommunityPosts(communityId) {
    const snap = await getDocs(query(
      collection(db, 'communityPosts'),
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc'),
      limit(50),
    ));
    return snap.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => item.status !== 'REMOVED');
  },

  async createPost(community, post, author) {
    const title = clean(post.title);
    const content = clean(post.content);
    if (!title || !content) throw new Error('Post title and content are required.');

    const batch = writeBatch(db);
    const postRef = doc(collection(db, 'communityPosts'));
    batch.set(postRef, {
      communityId: community.id,
      communityName: community.name,
      title,
      content,
      category: post.category || community.category || 'Community',
      type: post.type || 'DISCUSSION',
      authorId: author.uid,
      authorName: author.name,
      authorUsername: author.username,
      reactions: { useful: [], insightful: [], innovative: [], supportive: [] },
      status: 'ACTIVE',
      createdAt: now(),
      updatedAt: now(),
    });
    batch.update(doc(db, 'communities', community.id), { postCount: increment(1), updatedAt: now() });
    batch.set(doc(collection(db, 'activityFeed')), {
      type: 'COMMUNITY_POST',
      category: post.category || community.category || 'Community',
      title,
      message: content.slice(0, 180),
      actorId: author.uid,
      actorName: author.name,
      link: `/communities/${community.id}`,
      createdAt: now(),
    });
    await batch.commit();
    await this.logReputation({ userId: author.uid, type: 'contribution', amount: 5, reason: 'Community post', sourceId: postRef.id });
    return postRef.id;
  },

  async reactToPost(postId, reactionKey, userId, hasReacted) {
    await updateDoc(doc(db, 'communityPosts', postId), {
      [`reactions.${reactionKey}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: now(),
    });
  },

  async reactToComment(commentId, reactionKey, userId, hasReacted) {
    await updateDoc(doc(db, 'communityComments', commentId), {
      [`reactions.${reactionKey}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: now(),
    });
  },

  async getComments(postIds) {
    if (!postIds.length) return [];
    const chunks = [];
    for (let i = 0; i < postIds.length; i += 10) chunks.push(postIds.slice(i, i + 10));
    const results = [];
    for (const chunk of chunks) {
      const snap = await getDocs(query(collection(db, 'communityComments'), where('postId', 'in', chunk), orderBy('createdAt', 'asc'), limit(100)));
      results.push(...snap.docs.map(item => ({ id: item.id, ...item.data() })));
    }
    return results.filter(item => item.status !== 'REMOVED');
  },

  async addComment({ postId, communityId, parentCommentId = null, text, author }) {
    const cleanText = clean(text);
    if (!cleanText) throw new Error('Comment cannot be empty.');
    const commentRef = await addDoc(collection(db, 'communityComments'), {
      postId,
      communityId,
      parentCommentId,
      text: cleanText,
      authorId: author.uid,
      authorName: author.name,
      authorUsername: author.username,
      reactions: { useful: [], supportive: [] },
      status: 'ACTIVE',
      createdAt: now(),
      updatedAt: now(),
    });
    await this.logReputation({ userId: author.uid, type: 'collaboration', amount: parentCommentId ? 3 : 2, reason: parentCommentId ? 'Community reply' : 'Community comment', sourceId: commentRef.id });
    return commentRef.id;
  },

  async followMember(follower, target) {
    if (follower.uid === target.uid) throw new Error('Members cannot follow themselves.');
    const id = followId(follower.uid, target.uid);
    const batch = writeBatch(db);
    batch.set(doc(db, 'memberFollowing', id), {
      followerId: follower.uid,
      followerName: follower.name,
      followingId: target.uid,
      followingName: target.name,
      createdAt: now(),
    });
    batch.set(doc(db, 'memberFollowers', followId(target.uid, follower.uid)), {
      followerId: follower.uid,
      followerName: follower.name,
      followingId: target.uid,
      followingName: target.name,
      createdAt: now(),
    });
    batch.set(doc(collection(db, 'activityFeed')), {
      type: 'FOLLOW',
      category: 'Community',
      title: `${follower.name} followed ${target.name}`,
      message: 'New member connection formed.',
      actorId: follower.uid,
      actorName: follower.name,
      link: `/profile/${target.uid}`,
      createdAt: now(),
    });
    await batch.commit();
    await this.logReputation({ userId: follower.uid, type: 'collaboration', amount: 1, reason: 'Followed a member', sourceId: target.uid });
  },

  async unfollowMember(followerId, followingId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'memberFollowing', followId(followerId, followingId)));
    batch.delete(doc(db, 'memberFollowers', followId(followingId, followerId)));
    await batch.commit();
  },

  async getFollowState(followerId, followingId) {
    if (!followerId || !followingId) return { following: false, mutual: false };
    const [followingSnap, mutualSnap] = await Promise.all([
      getDoc(doc(db, 'memberFollowing', followId(followerId, followingId))),
      getDoc(doc(db, 'memberFollowing', followId(followingId, followerId))),
    ]);
    return { following: followingSnap.exists(), mutual: followingSnap.exists() && mutualSnap.exists() };
  },

  async getActivityFeed(filters = {}) {
    const snap = await getDocs(query(collection(db, 'activityFeed'), orderBy('createdAt', 'desc'), limit(100)));
    const search = clean(filters.search).toLowerCase();
    return snap.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter(item => !filters.category || item.category === filters.category)
      .filter(item => !filters.type || item.type === filters.type)
      .filter(item => !search || searchable(item).includes(search));
  },

  async createShowcase(data, author) {
    const title = clean(data.title);
    if (!title) throw new Error('Showcase title is required.');
    const batch = writeBatch(db);
    const ref = doc(collection(db, 'publicShowcases'));
    const description = clean(data.description);
    batch.set(ref, {
      title,
      description,
      type: data.type || 'PROJECT',
      sourceId: data.sourceId || '',
      sourceCollection: data.sourceCollection || '',
      media: Array.isArray(data.media) ? data.media : [],
      authorId: author.uid,
      authorName: author.name,
      authorUsername: author.username,
      featured: false,
      status: 'ACTIVE',
      createdAt: now(),
      updatedAt: now(),
    });
    batch.set(doc(collection(db, 'activityFeed')), {
      type: 'SHOWCASE',
      category: 'Portfolio',
      title,
      message: description || `${author.name} featured new public work.`,
      actorId: author.uid,
      actorName: author.name,
      link: '/showcase',
      createdAt: now(),
    });
    await batch.commit();
    await this.logReputation({ userId: author.uid, type: 'innovation', amount: 5, reason: 'Public showcase created', sourceId: ref.id });
    return ref.id;
  },

  async getShowcases(filters = {}) {
    const snap = await getDocs(query(collection(db, 'publicShowcases'), orderBy('createdAt', 'desc'), limit(80)));
    const search = clean(filters.search).toLowerCase();
    return snap.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter(item => item.status !== 'REMOVED')
      .filter(item => !filters.type || item.type === filters.type)
      .filter(item => !search || searchable(item).includes(search));
  },

  async getPublicProfileByUsername(username) {
    const snap = await getDocs(query(collection(db, 'publicProfiles'), where('username', '==', username.toLowerCase()), limit(1)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  async getTrendingMembers() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(20)));
    return snap.docs.map(item => ({ id: item.id, ...item.data() }));
  },

  async getDiscoveryData() {
    const [members, showcases, posts] = await Promise.all([
      this.getTrendingMembers(),
      this.getShowcases({}),
      getDocs(query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(20))),
    ]);
    return {
      members,
      showcases,
      posts: posts.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => item.status !== 'REMOVED'),
    };
  },

  async logReputation({ userId, type, amount, reason, sourceId }) {
    const field = REPUTATION_FIELDS[type] || REPUTATION_FIELDS.contribution;
    const batch = writeBatch(db);
    batch.set(doc(collection(db, 'reputationLogs')), {
      userId,
      type,
      amount,
      reason,
      sourceId,
      createdAt: now(),
    });
    batch.update(doc(db, 'users', userId), {
      [`reputation.${field}`]: increment(amount),
      [`reputation.totalScore`]: increment(amount),
    });
    await batch.commit();
  },

  async reportContent({ targetType, targetId, reason, reporter }) {
    await addDoc(collection(db, 'contentReports'), {
      targetType,
      targetId,
      reason: clean(reason),
      reporterId: reporter.uid,
      reporterName: reporter.name,
      status: 'OPEN',
      warningIssued: false,
      suspensionRecommended: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },

  async removeContent(targetType, targetId) {
    const collectionName = targetType === 'COMMENT' ? 'communityComments' : targetType === 'SHOWCASE' ? 'publicShowcases' : 'communityPosts';
    await updateDoc(doc(db, collectionName, targetId), {
      status: 'REMOVED',
      updatedAt: now(),
    });
  },
};
