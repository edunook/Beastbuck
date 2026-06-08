import { db } from './config';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export const DEFAULT_SKILLS = [
  { id: 'physics', name: 'Physics', badge: 'scientist', category: 'Science', overview: 'Motion, energy, forces, measurement, and experiment thinking.' },
  { id: 'chemistry', name: 'Chemistry', badge: 'scientist', category: 'Science', overview: 'Materials, reactions, mixtures, safety, and evidence-based discovery.' },
  { id: 'biology', name: 'Biology', badge: 'researcher', category: 'Science', overview: 'Living systems, observation, ecosystems, health, and research notes.' },
  { id: 'programming', name: 'Programming', badge: 'developer', category: 'Technology', overview: 'Code, debugging, apps, tools, websites, and automation.' },
  { id: 'ai', name: 'AI', badge: 'developer', category: 'Technology', overview: 'Prompting, responsible AI use, model workflows, and AI-assisted building.' },
  { id: 'engineering', name: 'Engineering', badge: 'engineer', category: 'Build', overview: 'Prototypes, structures, systems, testing, iteration, and problem solving.' },
  { id: 'robotics', name: 'Robotics', badge: 'engineer', category: 'Build', overview: 'Mechanisms, sensors, coding, control, and robotics challenges.' },
  { id: 'leadership', name: 'Leadership', badge: 'leader', category: 'Company', overview: 'Planning, communication, project ownership, review, and team support.' },
  { id: 'marketing', name: 'Marketing', badge: 'marketer', category: 'Company', overview: 'Product stories, pitches, launch plans, posters, and audience research.' },
  { id: 'design', name: 'Design', badge: 'artist', category: 'Creative', overview: 'Interfaces, visual systems, product polish, layout, and user experience.' },
  { id: 'arts', name: 'Arts', badge: 'artist', category: 'Creative', overview: 'Drawing, craft, presentation, concept art, and creative expression.' },
];

export const SKILL_POST_TYPES = ['Discussion', 'Question', 'Guide', 'Tutorial', 'Challenge', 'Resource', 'Discovery'];
export const RESOURCE_TYPES = ['book', 'PDF', 'video', 'website', 'article'];

function clean(value) {
  return String(value || '').trim();
}

function skillsRef() {
  return collection(db, 'skills');
}

function postsRef() {
  return collection(db, 'skillPosts');
}

function resourcesRef() {
  return collection(db, 'resources');
}

function normalizeSkill(data) {
  return {
    name: clean(data.name),
    overview: clean(data.overview || data.description),
    description: clean(data.description || data.overview),
    category: clean(data.category) || 'Knowledge',
    badge: clean(data.badge),
    featured: Boolean(data.featured),
  };
}

function normalizePost(data) {
  return {
    skillId: data.skillId || '',
    type: data.type || 'Discussion',
    title: clean(data.title),
    body: clean(data.body),
    authorId: data.authorId || '',
    authorName: clean(data.authorName) || 'Member',
    featured: Boolean(data.featured),
  };
}

function normalizeResource(data) {
  return {
    skillId: data.skillId || '',
    type: data.type || 'website',
    title: clean(data.title),
    description: clean(data.description),
    url: clean(data.url),
    authorId: data.authorId || '',
    authorName: clean(data.authorName) || 'Member',
    featured: Boolean(data.featured),
  };
}

export const SkillsService = {
  async seedDefaultSkills(createdBy) {
    await Promise.all(DEFAULT_SKILLS.map(({ id, ...skill }) =>
      setDoc(doc(db, 'skills', id), {
        ...skill,
        description: skill.overview,
        featured: true,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true })
    ));
  },

  async createSkill(data, createdBy) {
    const skill = normalizeSkill(data);
    if (!skill.name || !skill.overview) throw new Error('Skill name and overview are required.');
    const id = skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await setDoc(doc(db, 'skills', id), {
      ...skill,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return id;
  },

  async getSkills() {
    try {
      const snap = await getDocs(query(skillsRef(), orderBy('name', 'asc'), limit(100)));
      const stored = snap.docs.map(item => ({ id: item.id, ...item.data() }));
      const merged = new Map(DEFAULT_SKILLS.map(skill => [skill.id, { ...skill, description: skill.overview }]));
      for (const skill of stored) merged.set(skill.id, { ...merged.get(skill.id), ...skill });
      return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('Skills read failed:', err);
      return DEFAULT_SKILLS.map(skill => ({ ...skill, description: skill.overview }));
    }
  },

  async getSkill(skillId) {
    const snap = await getDoc(doc(db, 'skills', skillId));
    const fallback = DEFAULT_SKILLS.find(skill => skill.id === skillId);
    if (snap.exists()) return { id: snap.id, ...fallback, ...snap.data() };
    return fallback ? { ...fallback, description: fallback.overview } : null;
  },

  async getSkillNetwork(skillId) {
    const [skill, postsSnap, resourcesSnap] = await Promise.all([
      this.getSkill(skillId),
      getDocs(query(postsRef(), where('skillId', '==', skillId), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(resourcesRef(), where('skillId', '==', skillId), orderBy('createdAt', 'desc'), limit(100))),
    ]);

    const posts = postsSnap.docs.map(item => ({ id: item.id, ...item.data() }));
    const resources = resourcesSnap.docs.map(item => ({ id: item.id, ...item.data() }));

    return {
      skill,
      discussions: posts.filter(post => ['Discussion', 'Question', 'Guide', 'Tutorial', 'Discovery'].includes(post.type)),
      challenges: posts.filter(post => post.type === 'Challenge'),
      resources,
    };
  },

  async createPost(data, author) {
    const post = normalizePost({
      ...data,
      authorId: author.uid,
      authorName: author.name,
    });
    if (!post.skillId || !post.title || !post.body) throw new Error('Post skill, title, and body are required.');

    const docRef = doc(postsRef());
    await setDoc(docRef, {
      ...post,
      likes: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.awardSkillXP({
      uid: author.uid,
      skillId: post.skillId,
      amount: post.type === 'Challenge' ? 40 : 20,
      reason: `${post.type} posted: ${post.title}`,
      sourceType: 'skillPost',
      sourceId: docRef.id,
      actorId: author.uid,
    });

    return docRef.id;
  },

  async createResource(data, author) {
    const resource = normalizeResource({
      ...data,
      authorId: author.uid,
      authorName: author.name,
    });
    if (!resource.skillId || !resource.title || !resource.url) throw new Error('Resource skill, title, and URL are required.');

    const docRef = doc(resourcesRef());
    await setDoc(docRef, {
      ...resource,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.awardSkillXP({
      uid: author.uid,
      skillId: resource.skillId,
      amount: 15,
      reason: `Resource shared: ${resource.title}`,
      sourceType: 'resource',
      sourceId: docRef.id,
      actorId: author.uid,
    });

    return docRef.id;
  },

  async featureResource(resourceId, featured) {
    await updateDoc(doc(db, 'resources', resourceId), {
      featured,
      updatedAt: serverTimestamp(),
    });
  },

  async awardSkillXP({ uid, skillId, amount, reason, sourceType = 'skill', sourceId = null, actorId = null }) {
    const safeAmount = Math.max(0, Number(amount || 0));
    if (!uid || !skillId || safeAmount <= 0) throw new Error('Skill XP requires a member, skill, and positive amount.');

    const userRef = doc(db, 'users', uid);
    const logRef = doc(collection(db, 'skillXpLogs'));
    const activityRef = doc(collection(db, 'activityLogs'));

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const currentSkillXp = userData.skillXp || {};
      const currentAmount = Number(currentSkillXp[skillId] || 0);

      transaction.update(userRef, {
        [`skillXp.${skillId}`]: currentAmount + safeAmount,
        [`skillStats.${skillId}.lastUpdatedAt`]: serverTimestamp(),
        [`skillStats.${skillId}.contributions`]: increment(1),
      });

      transaction.set(logRef, {
        userId: uid,
        skillId,
        amount: safeAmount,
        reason,
        sourceType,
        sourceId,
        actorId,
        createdAt: serverTimestamp(),
      });

      transaction.set(activityRef, {
        type: 'SKILL_XP_AWARDED',
        title: 'Skill XP Awarded',
        description: `${safeAmount} ${skillId} XP: ${reason}`,
        userId: uid,
        metadata: { skillId, sourceType, sourceId, amount: safeAmount, actorId },
        timestamp: serverTimestamp(),
      });
    });
  },

  async awardBadge(uid, badgeId) {
    await updateDoc(doc(db, 'users', uid), {
      specializations: arrayUnion(badgeId),
    });
  },
};
