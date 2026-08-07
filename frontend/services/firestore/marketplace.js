import { db } from '@services/firebase/config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { GamificationService } from './gamification';
import { UsersService } from './users';

export const MARKETPLACE_TYPES = [
  'Template',
  'Document',
  'Research Paper',
  'Course Material',
  'AI Prompt',
  'Code Component',
  'Design Asset',
  'Mind Map',
  'Whiteboard',
  'Innovation Asset',
  'Prototype File',
  'Project Kit',
  'Experiment Pack',
  'Knowledge Bundle',
  'Course',
];

export const RESOURCE_LICENSES = [
  'Public',
  'Internal',
  'Organization Only',
  'Team Only',
  'Private',
  'Open Source',
  'Commercial',
  'Educational',
];

const DEFAULT_CATEGORIES = [
  'AI Starter Pack',
  'Robotics Toolkit',
  'Research Toolkit',
  'Startup Toolkit',
  'Engineering Toolkit',
  'Education',
  'Design',
  'Code',
  'Innovation',
];

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

function clean(value) {
  return String(value || '').trim();
}

function searchable(item) {
  return [
    item.title,
    item.description,
    item.type,
    item.category,
    item.creatorName,
    item.creatorUsername,
    ...(item.tags || []),
  ].join(' ').toLowerCase();
}

function sortItems(items, sort = 'trending') {
  return [...items].sort((a, b) => {
    if (sort === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    if (sort === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'bookmarks') return (b.bookmarkCount || 0) - (a.bookmarkCount || 0);
    return ((b.downloadCount || 0) * 2 + (b.bookmarkCount || 0) + (b.rating || 0)) - ((a.downloadCount || 0) * 2 + (a.bookmarkCount || 0) + (a.rating || 0));
  });
}

export const MarketplaceService = {
  async createResource(data, creator) {
    const payload = {
      title: clean(data.title),
      description: clean(data.description),
      type: data.type || 'Template',
      category: data.category || 'Education',
      tags: data.tags || [],
      version: data.version || '1.0.0',
      license: data.license || 'Internal',
      visibility: data.visibility || 'INTERNAL',
      accessCost: Number(data.accessCost || 0),
      exchangeCurrency: data.exchangeCurrency || 'Credits',
      fileUrl: data.fileUrl || '',
      thumbnail: data.thumbnail || '',
      sourceType: data.sourceType || null,
      sourceId: data.sourceId || null,
      relatedResourceIds: data.relatedResourceIds || [],
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      status: data.status || 'DRAFT',
      featured: false,
      rating: 0,
      reviewCount: 0,
      downloadCount: 0,
      bookmarkCount: 0,
      viewCount: 0,
      qualityScore: 75,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (!payload.title || !payload.description) throw new Error('Resource title and description are required.');

    const ref = await addDoc(collection(db, 'marketplaceItems'), payload);
    await this.upsertCreatorProfile(creator.uid, {
      displayName: creator.name,
      username: creator.username,
    });
    await GamificationService.awardXP({
      uid: creator.uid,
      amount: 80,
      reason: `Marketplace resource created: ${payload.title}`,
      sourceType: 'MARKETPLACE_RESOURCE',
      sourceId: ref.id,
      actorId: creator.uid,
      metadata: { type: payload.type, category: payload.category },
    });
    await updateDoc(doc(db, 'users', creator.uid), {
      'stats.creatorScore': increment(5),
      'stats.resourcesPublished': increment(payload.status === 'PUBLISHED' ? 1 : 0),
      'stats.knowledgeContributions': increment(1),
    });
    return ref.id;
  },

  async updateResource(resourceId, updates) {
    await updateDoc(doc(db, 'marketplaceItems', resourceId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async getResource(resourceId) {
    const snap = await getDoc(doc(db, 'marketplaceItems', resourceId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async searchResources(filters = {}) {
    const snap = await getDocs(query(collection(db, 'marketplaceItems'), orderBy('createdAt', 'desc'), limit(200)));
    const term = clean(filters.search).toLowerCase();
    return sortItems(docsFrom(snap)
      .filter(item => filters.includeArchived || item.status !== 'ARCHIVED')
      .filter(item => filters.includeDrafts || item.status === 'PUBLISHED')
      .filter(item => !term || searchable(item).includes(term))
      .filter(item => !filters.type || item.type === filters.type)
      .filter(item => !filters.category || item.category === filters.category)
      .filter(item => !filters.creatorId || item.creatorId === filters.creatorId), filters.sort);
  },

  async getMarketplaceHome(userId) {
    const [resources, categoriesSnap, collectionsSnap, creatorsSnap, bookmarksSnap] = await Promise.all([
      this.searchResources({ sort: 'trending' }),
      getDocs(query(collection(db, 'marketplaceCategories'), limit(50))),
      getDocs(query(collection(db, 'marketplaceCollections'), orderBy('createdAt', 'desc'), limit(20))),
      getDocs(query(collection(db, 'creatorProfiles'), orderBy('reputation', 'desc'), limit(10))),
      userId ? getDocs(query(collection(db, 'marketplaceBookmarks'), where('userId', '==', userId))) : Promise.resolve({ docs: [] }),
    ]);
    const categories = docsFrom(categoriesSnap);
    const collections = docsFrom(collectionsSnap);
    const bookmarks = docsFrom(bookmarksSnap);
    const bookmarkedTypes = new Set(bookmarks.map(b => b.resourceType));
    return {
      featured: resources.filter(item => item.featured).slice(0, 6),
      trending: resources.slice(0, 6),
      newest: sortItems(resources, 'newest').slice(0, 6),
      recommended: resources.filter(item => bookmarkedTypes.size === 0 || bookmarkedTypes.has(item.type)).slice(0, 6),
      topCreators: docsFrom(creatorsSnap),
      categories: categories.length ? categories : DEFAULT_CATEGORIES.map(name => ({ id: name, name })),
      collections,
      stats: {
        resources: resources.length,
        creators: docsFrom(creatorsSnap).length,
        collections: collections.length,
        downloads: resources.reduce((sum, item) => sum + (item.downloadCount || 0), 0),
      },
    };
  },

  async getResourceDetail(resourceId, userId) {
    const [resource, reviewsSnap, bookmarkSnap, relatedSnap] = await Promise.all([
      this.getResource(resourceId),
      getDocs(query(collection(db, 'marketplaceReviews'), where('resourceId', '==', resourceId), orderBy('createdAt', 'desc'), limit(30))),
      userId ? getDoc(doc(db, 'marketplaceBookmarks', `${resourceId}_${userId}`)) : Promise.resolve(null),
      getDocs(query(collection(db, 'marketplaceItems'), where('status', '==', 'PUBLISHED'), limit(20))),
    ]);
    return {
      resource,
      reviews: docsFrom(reviewsSnap),
      isBookmarked: bookmarkSnap?.exists?.() || false,
      related: docsFrom(relatedSnap).filter(item => item.id !== resourceId && (item.category === resource?.category || item.type === resource?.type)).slice(0, 6),
    };
  },

  async incrementView(resourceId) {
    await updateDoc(doc(db, 'marketplaceItems', resourceId), { viewCount: increment(1) });
    await addDoc(collection(db, 'resourceAnalytics'), {
      resourceId,
      eventType: 'VIEW',
      createdAt: serverTimestamp(),
    });
  },

  async trackDownload(resource, userId) {
    await addDoc(collection(db, 'marketplaceDownloads'), {
      resourceId: resource.id,
      userId,
      creatorId: resource.creatorId,
      accessCost: resource.accessCost || 0,
      exchangeCurrency: resource.exchangeCurrency || 'Credits',
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'marketplaceItems', resource.id), { downloadCount: increment(1), updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'creatorProfiles', resource.creatorId), { downloads: increment(1), reputation: increment(2), updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', resource.creatorId), {
      'stats.creatorScore': increment(2),
      'stats.marketplaceDownloads': increment(1),
    });
  },

  async bookmarkResource(resource, userId) {
    await setDoc(doc(db, 'marketplaceBookmarks', `${resource.id}_${userId}`), {
      resourceId: resource.id,
      resourceType: resource.type,
      userId,
      creatorId: resource.creatorId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'marketplaceItems', resource.id), { bookmarkCount: increment(1), updatedAt: serverTimestamp() });
  },

  async addReview(resourceId, userId, data) {
    const rating = Math.max(1, Math.min(5, Number(data.rating || 5)));
    const reviewRef = await addDoc(collection(db, 'marketplaceReviews'), {
      resourceId,
      userId,
      rating,
      review: clean(data.review),
      feedback: clean(data.feedback),
      helpfulVotes: 0,
      qualityScore: Number(data.qualityScore || rating * 20),
      status: 'PUBLISHED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const reviews = docsFrom(await getDocs(query(collection(db, 'marketplaceReviews'), where('resourceId', '==', resourceId))));
    const avg = reviews.length ? Math.round((reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length) * 10) / 10 : rating;
    await updateDoc(doc(db, 'marketplaceItems', resourceId), {
      rating: avg,
      reviewCount: reviews.length,
      updatedAt: serverTimestamp(),
    });
    return reviewRef.id;
  },

  async createCollection(data, creator) {
    const ref = await addDoc(collection(db, 'marketplaceCollections'), {
      title: clean(data.title),
      description: clean(data.description),
      resourceIds: data.resourceIds || [],
      category: data.category || 'Toolkit',
      visibility: data.visibility || 'INTERNAL',
      creatorId: creator.uid,
      creatorName: creator.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'creatorProfiles', creator.uid), { collections: increment(1), updatedAt: serverTimestamp() });
    return ref.id;
  },

  async upsertCreatorProfile(uid, data = {}) {
    const user = await UsersService.getUserProfile(uid);
    await setDoc(doc(db, 'creatorProfiles', uid), {
      uid,
      username: data.username || user?.username || '',
      displayName: data.displayName || user?.displayName || user?.username || 'Creator',
      bio: data.bio || user?.bio || '',
      skills: data.skills || user?.skills || [],
      specializations: data.specializations || user?.specializations || [],
      reputation: data.reputation || user?.stats?.creatorScore || 0,
      followers: data.followers || 0,
      downloads: data.downloads || 0,
      resources: data.resources || 0,
      collections: data.collections || 0,
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt || serverTimestamp(),
    }, { merge: true });
  },

  async followCreator(creatorId, userId) {
    await setDoc(doc(db, 'creatorFollowers', `${creatorId}_${userId}`), {
      creatorId,
      userId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'creatorProfiles', creatorId), { followers: increment(1), updatedAt: serverTimestamp() });
  },

  async getCreatorProfile(username) {
    const uid = await UsersService.getUidForUsername(username);
    if (!uid) return null;
    await this.upsertCreatorProfile(uid);
    const [profileSnap, resourcesSnap, collectionsSnap, researchSnap, coursesSnap] = await Promise.all([
      getDoc(doc(db, 'creatorProfiles', uid)),
      getDocs(query(collection(db, 'marketplaceItems'), where('creatorId', '==', uid), limit(100))),
      getDocs(query(collection(db, 'marketplaceCollections'), where('creatorId', '==', uid), limit(50))),
      getDocs(query(collection(db, 'projects'), where('ownerId', '==', uid), limit(20))),
      getDocs(query(collection(db, 'courses'), where('creatorId', '==', uid), limit(20))),
    ]);
    return {
      uid,
      profile: profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } : null,
      resources: docsFrom(resourcesSnap),
      collections: docsFrom(collectionsSnap),
      research: docsFrom(researchSnap).filter(item => ['RESEARCH', 'INVENTION', 'PROTOTYPE'].includes(item.projectType)),
      courses: docsFrom(coursesSnap),
    };
  },

  async getMarketplaceHealth() {
    const [itemsSnap, reviewsSnap, downloadsSnap, bookmarksSnap, creatorsSnap, reportsSnap, categoriesSnap, transactionsSnap] = await Promise.all([
      getDocs(collection(db, 'marketplaceItems')),
      getDocs(collection(db, 'marketplaceReviews')),
      getDocs(collection(db, 'marketplaceDownloads')),
      getDocs(collection(db, 'marketplaceBookmarks')),
      getDocs(collection(db, 'creatorProfiles')),
      getDocs(collection(db, 'marketplaceReports')),
      getDocs(collection(db, 'marketplaceCategories')),
      getDocs(collection(db, 'marketplaceTransactions')),
    ]);
    const items = docsFrom(itemsSnap);
    const creators = docsFrom(creatorsSnap);
    const transactions = docsFrom(transactionsSnap);
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category || 'Other'] = (acc[item.category || 'Other'] || 0) + 1;
      return acc;
    }, {});
    
    // Expanded marketplace intelligence metrics
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const recentTx = transactions.filter(tx => (new Date() - (tx.createdAt?.toMillis?.() || 0)) < 30 * 24 * 60 * 60 * 1000);
    const transactionVelocity = recentTx.length;
    
    const csatAvg = reviewsSnap.size > 0 
      ? docsFrom(reviewsSnap).reduce((sum, r) => sum + (r.qualityScore || 100), 0) / reviewsSnap.size 
      : 100;

    return {
      totalResources: items.length,
      publishedResources: items.filter(item => item.status === 'PUBLISHED').length,
      archivedResources: items.filter(item => item.status === 'ARCHIVED').length,
      totalReviews: reviewsSnap.size,
      totalDownloads: downloadsSnap.size,
      totalBookmarks: bookmarksSnap.size,
      totalCreators: creators.length,
      pendingReports: docsFrom(reportsSnap).filter(report => report.status === 'OPEN').length,
      categoryCount: categoriesSnap.size || DEFAULT_CATEGORIES.length,
      topCreators: creators.sort((a, b) => (b.reputation || 0) - (a.reputation || 0)).slice(0, 5),
      popularCategories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      topResources: sortItems(items.filter(item => item.status === 'PUBLISHED'), 'downloads').slice(0, 8),
      marketplaceHealthLabel: docsFrom(reportsSnap).filter(report => report.status === 'OPEN').length > 5 ? 'Needs Moderation' : 'Healthy',
      intelligence: {
        totalRevenue,
        transactionVelocity,
        csatAvg,
        economicHealthScore: Math.min(100, Math.round(csatAvg * 0.4 + Math.min(transactionVelocity, 100) * 0.6))
      }
    };
  },

  // ---------------------------------------------------------------------------
  // IMMUTABLE TRANSACTION LEDGER
  // ---------------------------------------------------------------------------
  async processTransaction({ senderId, receiverId, amount, currency = 'Credits', reason, itemType, itemId, auditMetadata = {} }) {
    if (amount <= 0) throw new Error('Transaction amount must be positive');
    
    const txRef = await addDoc(collection(db, 'marketplaceTransactions'), {
      senderId,
      receiverId,
      amount,
      currency,
      reason,
      itemType, // 'RESOURCE', 'SERVICE', 'BUNDLE', 'SUBSCRIPTION'
      itemId,
      status: 'COMPLETED',
      auditMetadata: {
        ...auditMetadata,
        ipAddress: 'simulated',
        processor: currency === 'Credits' ? 'BeastBuck Internal Ledger' : 'External Gateway'
      },
      createdAt: serverTimestamp()
    });

    // Update balances
    if (currency === 'Credits') {
      if (senderId !== 'SYSTEM') {
        await updateDoc(doc(db, 'users', senderId), { credits: increment(-amount) });
      }
      if (receiverId !== 'SYSTEM') {
        await updateDoc(doc(db, 'users', receiverId), { credits: increment(amount) });
        await updateDoc(doc(db, 'creatorProfiles', receiverId), { 
          totalEarnings: increment(amount),
          updatedAt: serverTimestamp() 
        });
      }
    }

    return txRef.id;
  },

  async getTransactionHistory(userId) {
    const sent = await getDocs(query(collection(db, 'marketplaceTransactions'), where('senderId', '==', userId), orderBy('createdAt', 'desc'), limit(50)));
    const received = await getDocs(query(collection(db, 'marketplaceTransactions'), where('receiverId', '==', userId), orderBy('createdAt', 'desc'), limit(50)));
    const all = [...docsFrom(sent), ...docsFrom(received)];
    return all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 50);
  },

  // ---------------------------------------------------------------------------
  // SERVICES (Mentorship, Consulting, etc.)
  // ---------------------------------------------------------------------------
  async createService(data, creator) {
    const ref = await addDoc(collection(db, 'marketplaceServices'), {
      title: clean(data.title),
      description: clean(data.description),
      category: data.category || 'Consulting',
      serviceModel: data.serviceModel || 'HOURLY', // HOURLY, MILESTONE, SUBSCRIPTION, PACKAGE, CUSTOM
      pricingCurrency: data.pricingCurrency || 'Credits',
      price: Number(data.price || 0),
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      status: data.status || 'DRAFT',
      rating: 0,
      reviewCount: 0,
      orderCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getServices(limitCount = 50) {
    const snap = await getDocs(query(collection(db, 'marketplaceServices'), where('status', '==', 'PUBLISHED'), orderBy('createdAt', 'desc'), limit(limitCount)));
    return docsFrom(snap);
  },

  // ---------------------------------------------------------------------------
  // WISHLIST / SAVED ITEMS
  // ---------------------------------------------------------------------------
  async toggleWishlist(resourceId, resourceType, userId) {
    const refId = `${resourceId}_${userId}`;
    const snap = await getDoc(doc(db, 'marketplaceWishlist', refId));
    if (snap.exists()) {
      await updateDoc(doc(db, 'marketplaceWishlist', refId), { status: 'REMOVED', updatedAt: serverTimestamp() });
      return false;
    } else {
      await setDoc(doc(db, 'marketplaceWishlist', refId), {
        resourceId,
        resourceType,
        userId,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    }
  },

  async getUserWishlist(userId) {
    const snap = await getDocs(query(collection(db, 'marketplaceWishlist'), where('userId', '==', userId), where('status', '==', 'ACTIVE')));
    return docsFrom(snap);
  },

  // ---------------------------------------------------------------------------
  // ASSET BUNDLES
  // ---------------------------------------------------------------------------
  async createBundle(data, creator) {
    const ref = await addDoc(collection(db, 'marketplaceBundles'), {
      title: clean(data.title),
      description: clean(data.description),
      resourceIds: data.resourceIds || [],
      price: Number(data.price || 0),
      currency: data.currency || 'Credits',
      discountPercentage: Number(data.discountPercentage || 0),
      creatorId: creator.uid,
      status: data.status || 'PUBLISHED',
      purchaseCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getBundles() {
    const snap = await getDocs(query(collection(db, 'marketplaceBundles'), where('status', '==', 'PUBLISHED'), orderBy('createdAt', 'desc')));
    return docsFrom(snap);
  }
};
