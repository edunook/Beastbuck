import { db } from '@services/firebase/config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { MissionControlService } from './missionControl';
import { CommunityService } from './community';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const UNIVERSE_GOAL_TYPES = [
  'Learning',
  'Research',
  'Project',
  'Innovation',
  'Career',
];

export const SEARCH_CATEGORIES = [
  'All',
  'Members',
  'Projects',
  'Research',
  'Inventions',
  'Ventures',
  'Courses',
  'Lessons',
  'Certificates',
  'Documents',
  'Workspaces',
  'Resources',
  'Communities',
  'Events',
  'Tasks',
  'Challenges',
  'Marketplace',
];

export const KNOWLEDGE_NODE_TYPES = [
  'member',
  'project',
  'research',
  'skill',
  'course',
  'resource',
  'venture',
  'community',
  'document',
  'invention',
  'discovery',
];

export const JOURNEY_MILESTONES = [
  'joined',
  'firstCourse',
  'firstProject',
  'firstResearch',
  'firstInvention',
  'firstVenture',
  'leadership',
  'skillMilestone',
  'careerPath',
];

function matchesTerm(fields, term) {
  const t = term.toLowerCase();
  return fields.some(f => String(f || '').toLowerCase().includes(t));
}

function sortResults(items, sortBy) {
  if (sortBy === 'title') {
    return [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }
  if (sortBy === 'type') {
    return [...items].sort((a, b) => (a.type || '').localeCompare(b.type || ''));
  }
  return items;
}

export const UniverseService = {
  // ---------------------------------------------------------------------------
  // UNIVERSE PROFILE
  // ---------------------------------------------------------------------------
  async getUniverseProfile(uid) {
    if (!uid) return null;
    const snap = await getDoc(doc(db, 'universeProfiles', uid));
    if (!snap.exists()) {
      return {
        uid,
        highlights: {},
        focusAreas: [],
        publicSummary: '',
        crossLinks: [],
      };
    }
    return { id: snap.id, ...snap.data() };
  },

  async upsertUniverseProfile(uid, updates) {
    const ref = doc(db, 'universeProfiles', uid);
    const snap = await getDoc(ref);
    const payload = {
      ...updates,
      uid,
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(ref, payload);
    }
  },

  // ---------------------------------------------------------------------------
  // MEMBER INTERESTS & GOALS & JOURNEY
  // ---------------------------------------------------------------------------
  async getMemberInterests(uid) {
    const snap = await getDoc(doc(db, 'memberInterests', uid));
    return snap.exists() ? snap.data() : { topics: [], skills: [], roles: [] };
  },

  async saveMemberInterests(uid, interests) {
    await setDoc(doc(db, 'memberInterests', uid), {
      ...interests,
      uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  async getMemberGoals(uid) {
    try {
      const snap = await getDocs(
        query(collection(db, 'memberGoals'), where('userId', '==', uid), limit(50))
      );
      return docsFrom(snap).sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch {
      const snap = await getDocs(query(collection(db, 'memberGoals'), where('userId', '==', uid), limit(50)));
      return docsFrom(snap);
    }
  },

  async createMemberGoal(uid, { title, type, targetDate, description = '' }) {
    const ref = await addDoc(collection(db, 'memberGoals'), {
      userId: uid,
      title,
      type: type || 'Learning',
      description,
      targetDate: targetDate || null,
      progress: 0,
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateMemberGoal(goalId, updates) {
    await updateDoc(doc(db, 'memberGoals', goalId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async getMemberJourney(uid) {
    const snap = await getDoc(doc(db, 'memberJourney', uid));
    if (!snap.exists()) {
      return { uid, milestones: {}, careerPath: '', skillDevelopment: [] };
    }
    return snap.data();
  },

  async recordJourneyMilestone(uid, milestone, metadata = {}) {
    const ref = doc(db, 'memberJourney', uid);
    const snap = await getDoc(ref);
    const milestones = snap.exists() ? (snap.data().milestones || {}) : {};
    if (!milestones[milestone]) {
      milestones[milestone] = { at: new Date().toISOString(), ...metadata };
      await setDoc(ref, {
        uid,
        milestones,
        updatedAt: serverTimestamp(),
        ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });
    }
  },

  // ---------------------------------------------------------------------------
  // KNOWLEDGE GRAPH
  // ---------------------------------------------------------------------------
  async getKnowledgeGraph(graphId = 'beastbuck-main') {
    const snap = await getDoc(doc(db, 'knowledgeGraph', graphId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : { id: graphId, name: 'BeastBuck Knowledge Graph', nodeCount: 0, edgeCount: 0 };
  },

  async getKnowledgeNodes({ type, limitCount = 100 } = {}) {
    let q = query(collection(db, 'knowledgeNodes'), orderBy('updatedAt', 'desc'), limit(limitCount));
    if (type) q = query(collection(db, 'knowledgeNodes'), where('type', '==', type), limit(limitCount));
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async getKnowledgeEdges({ nodeId, limitCount = 200 } = {}) {
    let q = query(collection(db, 'knowledgeEdges'), limit(limitCount));
    if (nodeId) {
      q = query(collection(db, 'knowledgeEdges'), where('sourceId', '==', nodeId), limit(limitCount));
    }
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  async upsertKnowledgeNode({ id, type, title, refId, metadata = {} }) {
    const nodeId = id || `${type}_${refId}`;
    await setDoc(doc(db, 'knowledgeNodes', nodeId), {
      type,
      title,
      refId,
      metadata,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    return nodeId;
  },

  async linkKnowledgeNodes({ sourceId, targetId, relation, createdBy }) {
    const ref = await addDoc(collection(db, 'knowledgeEdges'), {
      sourceId,
      targetId,
      relation: relation || 'related_to',
      createdBy,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'crossSystemLinks'), {
      sourceType: 'knowledge',
      sourceId,
      targetType: 'knowledge',
      targetId,
      relation,
      createdBy,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getCrossSystemLinks({ refId, limitCount = 50 } = {}) {
    let q = query(collection(db, 'crossSystemLinks'), orderBy('createdAt', 'desc'), limit(limitCount));
    if (refId) {
      q = query(
        collection(db, 'crossSystemLinks'),
        where('sourceId', '==', refId),
        limit(limitCount)
      );
    }
    const snap = await getDocs(q);
    return docsFrom(snap);
  },

  // ---------------------------------------------------------------------------
  // UNIFIED SEARCH
  // ---------------------------------------------------------------------------
  async unifiedSearch(searchTerm, { category = 'All', sortBy = 'relevance', limitCount = 60 } = {}) {
    if (!searchTerm || searchTerm.length < 2) return { results: [], suggestions: [] };

    const base = await MissionControlService.globalSearch(searchTerm);
    const term = searchTerm.toLowerCase();

    const extraQueries = await Promise.all([
      getDocs(query(collection(db, 'courses'), where('status', '==', 'PUBLISHED'), limit(200))),
      getDocs(query(collection(db, 'courseLessons'), limit(200))),
      getDocs(query(collection(db, 'certificates'), limit(200))),
      getDocs(query(collection(db, 'communities'), limit(100))),
      getDocs(query(collection(db, 'events'), limit(100))),
      getDocs(query(collection(db, 'tasks'), limit(300))),
      getDocs(query(collection(db, 'challenges'), limit(100))),
      getDocs(query(collection(db, 'discoveries'), limit(200))),
      getDocs(query(collection(db, 'inventions'), limit(200))),
      getDocs(query(collection(db, 'knowledgeArticles'), where('status', '==', 'PUBLISHED'), limit(200))),
    ]);

    const [
      coursesSnap,
      lessonsSnap,
      certsSnap,
      communitiesSnap,
      eventsSnap,
      tasksSnap,
      challengesSnap,
      discoveriesSnap,
      inventionsSnap,
      articlesSnap,
    ] = extraQueries;

    const results = [...base];

    docsFrom(coursesSnap).forEach(c => {
      if (matchesTerm([c.title, c.description, c.category], term)) {
        results.push({
          type: 'course',
          id: c.id,
          title: c.title,
          subtitle: c.category || 'Course',
          link: `/academy/course/${c.id}`,
          category: 'Courses',
        });
      }
    });

    docsFrom(lessonsSnap).forEach(l => {
      if (matchesTerm([l.title, l.content], term)) {
        results.push({
          type: 'lesson',
          id: l.id,
          title: l.title || 'Lesson',
          subtitle: 'Lesson',
          link: l.courseId ? `/academy/course/${l.courseId}` : '/academy',
          category: 'Lessons',
        });
      }
    });

    docsFrom(certsSnap).forEach(cert => {
      if (matchesTerm([cert.title, cert.recipientName, cert.courseName], term)) {
        results.push({
          type: 'certificate',
          id: cert.id,
          title: cert.title || cert.courseName || 'Certificate',
          subtitle: 'Certificate',
          link: `/verify/${cert.id}`,
          category: 'Certificates',
        });
      }
    });

    docsFrom(communitiesSnap).forEach(c => {
      if (matchesTerm([c.name, c.description], term)) {
        results.push({
          type: 'community',
          id: c.id,
          title: c.name,
          subtitle: `${c.memberCount || 0} members`,
          link: `/communities/${c.id}`,
          category: 'Communities',
        });
      }
    });

    docsFrom(eventsSnap).forEach(e => {
      if (matchesTerm([e.title, e.description], term)) {
        results.push({
          type: 'event',
          id: e.id,
          title: e.title,
          subtitle: e.status || 'Event',
          link: `/events/${e.id}`,
          category: 'Events',
        });
      }
    });

    docsFrom(tasksSnap).forEach(t => {
      if (matchesTerm([t.title, t.description], term)) {
        results.push({
          type: 'task',
          id: t.id,
          title: t.title,
          subtitle: t.status || 'Task',
          link: '/tasks',
          category: 'Tasks',
        });
      }
    });

    docsFrom(challengesSnap).forEach(ch => {
      if (matchesTerm([ch.title, ch.description], term)) {
        results.push({
          type: 'challenge',
          id: ch.id,
          title: ch.title,
          subtitle: 'Challenge',
          link: `/challenges/${ch.id}`,
          category: 'Challenges',
        });
      }
    });

    docsFrom(discoveriesSnap).forEach(d => {
      if (matchesTerm([d.title, d.summary, d.description], term)) {
        results.push({
          type: 'research',
          id: d.id,
          title: d.title,
          subtitle: 'Discovery',
          link: '/innovation',
          category: 'Research',
        });
      }
    });

    docsFrom(inventionsSnap).forEach(inv => {
      if (matchesTerm([inv.title, inv.description], term)) {
        results.push({
          type: 'invention',
          id: inv.id,
          title: inv.title,
          subtitle: inv.status || 'Invention',
          link: '/innovation',
          category: 'Inventions',
        });
      }
    });

    docsFrom(articlesSnap).forEach(a => {
      if (matchesTerm([a.title, a.summary, a.content], term)) {
        results.push({
          type: 'article',
          id: a.id,
          title: a.title,
          subtitle: a.category || 'Knowledge',
          link: `/knowledge/article/${a.id}`,
          category: 'Resources',
        });
      }
    });

    const categoryMap = {
      Members: ['user'],
      Projects: ['project'],
      Research: ['research', 'experiment'],
      Inventions: ['invention', 'product'],
      Ventures: ['venture'],
      Courses: ['course'],
      Lessons: ['lesson'],
      Certificates: ['certificate'],
      Documents: ['document'],
      Workspaces: ['workspace'],
      Resources: ['resource', 'article'],
      Communities: ['community'],
      Events: ['event'],
      Tasks: ['task'],
      Challenges: ['challenge'],
      Marketplace: ['resource'],
    };

    let filtered = results;
    if (category && category !== 'All') {
      const types = categoryMap[category] || [];
      filtered = results.filter(r => types.includes(r.type) || r.category === category);
    }

    const deduped = [];
    const seen = new Set();
    filtered.forEach(item => {
      const key = `${item.type}:${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    });

    const sorted = sortResults(deduped, sortBy).slice(0, limitCount);

    await this.logSearchQuery(searchTerm, sorted.length);

    const suggestions = this.buildSearchSuggestions(searchTerm, sorted);

    return { results: sorted, suggestions };
  },

  buildSearchSuggestions(term, results) {
    const topics = new Set();
    results.slice(0, 8).forEach(r => {
      if (r.subtitle) topics.add(r.subtitle.split('·')[0].trim());
    });
    return [
      `Who knows about ${term}?`,
      `Projects related to ${term}`,
      `Courses for ${term}`,
      ...Array.from(topics).slice(0, 3).map(t => `${term} in ${t}`),
    ];
  },

  async logSearchQuery(term, resultCount) {
    try {
      await addDoc(collection(db, 'unifiedSearchIndex'), {
        term: term.toLowerCase(),
        resultCount,
        searchedAt: serverTimestamp(),
      });
    } catch {
      // non-blocking analytics
    }
  },

  // ---------------------------------------------------------------------------
  // RECOMMENDATIONS & FEED
  // ---------------------------------------------------------------------------
  async getRecommendations(uid, { limitCount = 12 } = {}) {
    const cached = await getDocs(
      query(
        collection(db, 'recommendationEngine'),
        where('userId', '==', uid),
        limit(limitCount)
      )
    ).catch(() => null);

    if (cached?.docs?.length) {
      return docsFrom(cached).sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    try {
      const [interests, journey, users, courses, ventures, communities] = await Promise.all([
        this.getMemberInterests(uid),
        this.getMemberJourney(uid),
        getDocs(query(collection(db, 'users'), limit(100))),
        getDocs(query(collection(db, 'courses'), where('status', '==', 'PUBLISHED'), limit(30))),
        getDocs(query(collection(db, 'ventures'), limit(30))),
        getDocs(query(collection(db, 'communities'), limit(20))),
      ]);

      const topics = (interests.topics || []).map(t => t.toLowerCase());
      const recs = [];

      docsFrom(users)
        .filter(u => u.id !== uid)
        .slice(0, 5)
        .forEach(u => {
          const specMatch = (u.specializations || []).some(s =>
            topics.some(t => String(s).toLowerCase().includes(t))
          );
          recs.push({
            type: 'member',
            title: u.displayName || u.username,
            subtitle: u.role,
            link: `/profile/${u.id}`,
            score: specMatch ? 90 : 50,
            reason: specMatch ? 'Matches your interests' : 'Active member',
          });
        });

      docsFrom(courses).forEach(c => {
        const match = topics.some(t =>
          [c.title, c.description, c.category].join(' ').toLowerCase().includes(t)
        );
        recs.push({
          type: 'course',
          title: c.title,
          subtitle: c.category,
          link: `/academy/course/${c.id}`,
          score: match ? 85 : 45,
          reason: match ? 'Based on your learning interests' : 'Popular course',
        });
      });

      docsFrom(ventures).forEach(v => {
        recs.push({
          type: 'venture',
          title: v.title,
          subtitle: v.stage,
          link: `/ventures/${v.id}`,
          score: 55,
          reason: 'Innovation opportunity',
        });
      });

      docsFrom(communities).forEach(c => {
        recs.push({
          type: 'community',
          title: c.name,
          subtitle: `${c.memberCount || 0} members`,
          link: `/communities/${c.id}`,
          score: 50,
          reason: 'Community match',
        });
      });

      if (!journey.milestones?.firstCourse) {
        recs.unshift({
          type: 'mentor',
          title: 'Start your first course',
          subtitle: 'Academy',
          link: '/academy',
          score: 95,
          reason: 'Journey milestone',
        });
      }

      return recs.sort((a, b) => b.score - a.score).slice(0, limitCount);
    } catch {
      return [];
    }
  },

  async getRecommendationsLegacy(uid, { limitCount = 12 } = {}) {
    try {
      return docsFrom(await getDocs(
        query(
          collection(db, 'recommendationEngine'),
          where('userId', '==', uid),
          limit(limitCount)
        )
      ));
    } catch {
      return [];
    }
  },

  async getPersonalizedFeed(uid, filters = {}) {
    const [communityFeed, recs, goals] = await Promise.all([
      CommunityService.getActivityFeed(filters).catch(() => []),
      this.getRecommendations(uid, { limitCount: 6 }),
      this.getMemberGoals(uid),
    ]);

    const personalized = recs.map(r => ({
      id: `rec-${r.type}-${r.link}`,
      type: 'RECOMMENDATION',
      category: 'Universe',
      title: r.title,
      message: r.reason,
      link: r.link,
      createdAt: { toDate: () => new Date() },
    }));

    const goalItems = goals.slice(0, 3).map(g => ({
      id: `goal-${g.id}`,
      type: 'GOAL',
      category: 'Goals',
      title: g.title,
      message: `${g.type} goal · ${g.progress || 0}% complete`,
      link: '/universe/goals',
      createdAt: g.createdAt,
    }));

    const merged = [...personalized, ...goalItems, ...communityFeed];
    return merged.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const db_ = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return db_ - da;
    });
  },

  // ---------------------------------------------------------------------------
  // SMART COLLECTIONS
  // ---------------------------------------------------------------------------
  async getSmartCollections() {
    const snap = await getDocs(
      query(collection(db, 'smartCollections'), orderBy('priority', 'desc'), limit(20))
    );
    if (snap.docs.length) return docsFrom(snap);

    return [
      { id: 'trending-ai', title: 'Trending AI Research', slug: 'trending-ai-research', type: 'research', auto: true },
      { id: 'beginner-courses', title: 'Best Beginner Courses', slug: 'beginner-courses', type: 'course', auto: true },
      { id: 'top-innovation', title: 'Top Innovation Projects', slug: 'top-innovation', type: 'project', auto: true },
      { id: 'active-communities', title: 'Most Active Communities', slug: 'active-communities', type: 'community', auto: true },
      { id: 'growing-ventures', title: 'Fastest Growing Ventures', slug: 'growing-ventures', type: 'venture', auto: true },
    ];
  },

  async resolveSmartCollection(collectionDef) {
    const type = collectionDef.type;
    if (type === 'course') {
      const snap = await getDocs(query(collection(db, 'courses'), where('status', '==', 'PUBLISHED'), limit(8)));
      return docsFrom(snap).map(c => ({ title: c.title, link: `/academy/course/${c.id}`, subtitle: c.category }));
    }
    if (type === 'venture') {
      const snap = await getDocs(query(collection(db, 'ventures'), orderBy('updatedAt', 'desc'), limit(8)));
      return docsFrom(snap).map(v => ({ title: v.title, link: `/ventures/${v.id}`, subtitle: v.stage }));
    }
    if (type === 'community') {
      const snap = await getDocs(query(collection(db, 'communities'), limit(8)));
      return docsFrom(snap)
        .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
        .map(c => ({ title: c.name, link: `/communities/${c.id}`, subtitle: `${c.memberCount || 0} members` }));
    }
    if (type === 'research') {
      const snap = await getDocs(query(collection(db, 'discoveries'), limit(8)));
      return docsFrom(snap).map(d => ({ title: d.title, link: '/innovation', subtitle: 'Discovery' }));
    }
    const snap = await getDocs(query(collection(db, 'projects'), limit(8)));
    return docsFrom(snap).map(p => ({ title: p.title, link: '/workspace', subtitle: p.status }));
  },

  // ---------------------------------------------------------------------------
  // ECOSYSTEM & UNIVERSE ANALYTICS
  // ---------------------------------------------------------------------------
  async getEcosystemInsights() {
    const snap = await getDocs(
      query(collection(db, 'ecosystemInsights'), orderBy('createdAt', 'desc'), limit(10))
    );
    if (snap.docs.length) return docsFrom(snap);
    return [];
  },

  async generateUniverseAnalytics(actorId) {
    const [
      articles,
      courses,
      ventures,
      communities,
      enrollments,
      discoveries,
      users,
    ] = await Promise.all([
      getDocs(collection(db, 'knowledgeArticles')),
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'ventures')),
      getDocs(collection(db, 'communities')),
      getDocs(collection(db, 'courseEnrollments')),
      getDocs(collection(db, 'discoveries')),
      getDocs(collection(db, 'users')),
    ]);

    const analytics = {
      generatedBy: actorId,
      knowledgeGrowth: articles.size,
      learningGrowth: enrollments.size,
      innovationGrowth: discoveries.size,
      communityGrowth: communities.size,
      ventureGrowth: ventures.size,
      crossSystemActivity: courses.size + ventures.size + articles.size,
      totalMembers: users.size,
      timestamp: serverTimestamp(),
    };

    const id = `universe-${new Date().toISOString().split('T')[0]}`;
    await setDoc(doc(db, 'universeAnalytics', id), analytics, { merge: true });
    return analytics;
  },

  async getUniverseAnalytics(limitCount = 14) {
    const snap = await getDocs(
      query(collection(db, 'universeAnalytics'), orderBy('timestamp', 'desc'), limit(limitCount))
    );
    return docsFrom(snap).reverse();
  },

  async getUniverseDashboard(uid) {
    const [
      profile,
      interests,
      goals,
      journey,
      recommendations,
      collections,
      insights,
    ] = await Promise.all([
      this.getUniverseProfile(uid),
      this.getMemberInterests(uid),
      this.getMemberGoals(uid),
      this.getMemberJourney(uid),
      this.getRecommendations(uid),
      this.getSmartCollections(),
      this.getEcosystemInsights(),
    ]);

    const [projects, tasks, enrollments] = await Promise.all([
      getDocs(query(collection(db, 'projects'), limit(5))),
      getDocs(query(collection(db, 'tasks'), where('assigneeId', '==', uid), limit(5))).catch(() =>
        getDocs(query(collection(db, 'tasks'), limit(5)))
      ),
      getDocs(query(collection(db, 'courseEnrollments'), where('userId', '==', uid), limit(5))),
    ]);

    return {
      profile,
      interests,
      goals,
      journey,
      recommendations,
      collections,
      insights,
      projects: docsFrom(projects),
      tasks: docsFrom(tasks),
      enrollments: docsFrom(enrollments),
    };
  },

  // ---------------------------------------------------------------------------
  // ORGANIZATION INTELLIGENCE (leadership)
  // ---------------------------------------------------------------------------
  async getOrganizationIntelligence() {
    const [users, departments, projects, discoveries] = await Promise.all([
      getDocs(query(collection(db, 'users'), limit(500))),
      getDocs(query(collection(db, 'departments'), limit(50))),
      getDocs(query(collection(db, 'projects'), limit(200))),
      getDocs(query(collection(db, 'discoveries'), limit(100))),
    ]);

    const memberList = docsFrom(users);
    const skillMap = {};
    memberList.forEach(m => {
      (m.specializations || []).forEach(spec => {
        skillMap[spec] = (skillMap[spec] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill, count]) => ({ skill, count }));

    return {
      skillMap: topSkills,
      talentPool: memberList
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 10)
        .map(m => ({ id: m.id, name: m.displayName || m.username, xp: m.xp, role: m.role })),
      departmentCount: departments.size,
      activeProjects: docsFrom(projects).filter(p => p.status === 'ACTIVE').length,
      innovationCount: discoveries.size,
      collaborationNetwork: docsFrom(projects).slice(0, 8).map(p => ({
        id: p.id,
        title: p.title,
        members: (p.members || []).length,
      })),
    };
  },

  // ---------------------------------------------------------------------------
  // ADMIN: search & recommendation analytics
  // ---------------------------------------------------------------------------
  async getSearchAnalytics(limitCount = 50) {
    const snap = await getDocs(
      query(collection(db, 'unifiedSearchIndex'), orderBy('searchedAt', 'desc'), limit(limitCount))
    );
    const terms = docsFrom(snap);
    const counts = {};
    terms.forEach(t => {
      counts[t.term] = (counts[t.term] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  },

  async getRecommendationAnalytics() {
    const snap = await getDocs(query(collection(db, 'recommendationEngine'), limit(100)));
    return {
      cachedRecommendations: snap.size,
      samples: docsFrom(snap).slice(0, 10),
    };
  },

  async seedRecommendation(uid, items) {
    const batch = items.slice(0, 10);
    for (const item of batch) {
      await addDoc(collection(db, 'recommendationEngine'), {
        userId: uid,
        ...item,
        score: item.score || 50,
        createdAt: serverTimestamp(),
      });
    }
  },

  async getKnowledgeGraphStats() {
    const [nodes, edges] = await Promise.all([
      getDocs(query(collection(db, 'knowledgeNodes'), limit(500))),
      getDocs(query(collection(db, 'knowledgeEdges'), limit(500))),
    ]);
    return {
      nodeCount: nodes.size,
      edgeCount: edges.size,
      nodes: docsFrom(nodes).slice(0, 20),
      edges: docsFrom(edges).slice(0, 20),
    };
  },
};
