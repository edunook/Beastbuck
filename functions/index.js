/* eslint-disable */
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Helper function to regenerate portfolio for a user
async function regeneratePortfolioForUser(uid) {
  try {
    // Get user data to get username
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return;
    
    const username = userDoc.data().username;
    if (!username) return;

    // Fetch all portfolio data
    const [
      projectsSnap,
      experimentsSnap,
      productsSnap,
      discoveriesSnap,
      coursesSnap,
      tutorialsSnap,
      articlesSnap,
      foundedVenturesSnap,
      joinedVenturesSnap,
      userLearningSnap,
      learningPathsSnap,
      marketplaceResourcesSnap,
      marketplaceCollectionsSnap,
      marketplaceDownloadsSnap,
      certificatesSnap,
    ] = await Promise.all([
      db.collection('projects').where('memberIds', 'array-contains', uid).get(),
      db.collection('experiments').where('authors', 'array-contains', uid).get(),
      db.collection('products').where('authors', 'array-contains', uid).get(),
      db.collection('discoveries').where('authorId', '==', uid).get(),
      db.collection('courseEnrollments').where('userId', '==', uid).get(),
      db.collection('tutorials').where('authorId', '==', uid).get(),
      db.collection('knowledgeArticles').where('authorId', '==', uid).get(),
      db.collection('ventures').where('founderId', '==', uid).get(),
      db.collection('ventures').where('memberIds', 'array-contains', uid).get(),
      db.collection('userLearning').where('userId', '==', uid).get(),
      db.collection('learningPaths').get(),
      db.collection('marketplaceItems').where('creatorId', '==', uid).get(),
      db.collection('marketplaceCollections').where('creatorId', '==', uid).get(),
      db.collection('marketplaceDownloads').where('creatorId', '==', uid).get(),
      db.collection('certificates').where('userId', '==', uid).get(),
    ]);

    const profile = userDoc.data();
    const allProjects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
    const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
    const inventions = allProjects.filter(p => p.projectType === 'INVENTION');
    const prototypes = allProjects.filter(p => p.projectType === 'PROTOTYPE');
    const experiments = experimentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const discoveries = discoveriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const completedCourses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.status === 'COMPLETED');
    const authoredTutorials = tutorialsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.status === 'PUBLISHED');
    const publishedArticles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.status === 'PUBLISHED');
    const foundedVentures = foundedVenturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const joinedVentures = joinedVenturesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.founderId !== uid);
    const successfulVentures = [...foundedVentures, ...joinedVentures].filter(v => v.stage === 'SUCCESSFUL');
    const userLearning = userLearningSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const learningPaths = learningPathsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => l.status === 'PUBLISHED');
    const marketplaceResources = marketplaceResourcesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const marketplaceCollections = marketplaceCollectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const marketplaceDownloads = marketplaceDownloadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const certificates = certificatesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const stats = {
      totalXP: profile?.xp || 0,
      level: profile?.level || 1,
      projectsJoined: allProjects.length,
      experimentsCreated: experiments.length,
      productsCreated: products.length,
      certificatesEarned: certificates.length,
      achievementsEarned: (profile?.achievements || []).length,
      discoveriesCount: discoveries.length,
      inventionsCount: inventions.length,
      researchProjectsCount: researchProjects.length,
      prototypesCount: prototypes.length,
      foundedVenturesCount: foundedVentures.length,
      joinedVenturesCount: joinedVentures.length,
      successfulVenturesCount: successfulVentures.length,
      completedCoursesCount: completedCourses.length,
      skillNodesUnlocked: userLearning.filter(item => item.status === 'UNLOCKED').length,
      publishedResourcesCount: marketplaceResources.filter(item => item.status === 'PUBLISHED').length,
      marketplaceDownloadsCount: marketplaceDownloads.length,
      marketplaceCollectionsCount: marketplaceCollections.length,
      creatorRating: marketplaceResources.length ? Math.round((marketplaceResources.reduce((sum, item) => sum + (item.rating || 0), 0) / marketplaceResources.length) * 10) / 10 : 0,
    };

    const portfolioDoc = {
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      role: profile.role,
      level: stats.level,
      totalXP: stats.totalXP,
      projectsCount: stats.projectsJoined,
      certificatesCount: stats.certificatesEarned,
      achievementsCount: stats.achievementsEarned,
      researchProjectsCount: stats.researchProjectsCount,
      inventionsCount: stats.inventionsCount,
      discoveriesCount: stats.discoveriesCount,
      prototypesCount: stats.prototypesCount,
      foundedVenturesCount: stats.foundedVenturesCount,
      joinedVenturesCount: stats.joinedVenturesCount,
      completedCoursesCount: stats.completedCoursesCount,
      skillNodesUnlocked: stats.skillNodesUnlocked,
      publishedResourcesCount: stats.publishedResourcesCount,
      marketplaceDownloadsCount: stats.marketplaceDownloadsCount,
      creatorRating: stats.creatorRating,
      projects,
      researchProjects,
      inventions,
      prototypes,
      discoveries,
      certificates,
      foundedVentures,
      joinedVentures,
      successfulVentures,
      completedCourses,
      learningPaths,
      userLearning,
      marketplaceResources,
      marketplaceCollections,
      affiliations: [],
      updatedAt: new Date().toISOString(),
    };

    await db.collection('portfolios').doc(username).set(portfolioDoc, { merge: true });
    console.log(`Regenerated portfolio for ${username}`);
  } catch (error) {
    console.error('Error regenerating portfolio:', error);
  }
}

// Trigger on user profile changes
exports.onUserWritten = onDocumentWritten('users/{userId}', async (event) => {
  const { userId } = event.params;
  await regeneratePortfolioForUser(userId);
});

// Trigger on project changes
exports.onProjectWritten = onDocumentWritten('projects/{projectId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data || !data.memberIds) return;
  
  for (const uid of data.memberIds) {
    await regeneratePortfolioForUser(uid);
  }
});

// Trigger on certificate changes
exports.onCertificateWritten = onDocumentWritten('certificates/{certificateId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data || !data.userId) return;
  
  await regeneratePortfolioForUser(data.userId);
});

// Trigger on venture changes
exports.onVentureWritten = onDocumentWritten('ventures/{ventureId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data) return;
  
  const uids = [];
  if (data.founderId) uids.push(data.founderId);
  if (data.memberIds) uids.push(...data.memberIds);
  
  for (const uid of uids) {
    await regeneratePortfolioForUser(uid);
  }
});

// Trigger on discovery changes
exports.onDiscoveryWritten = onDocumentWritten('discoveries/{discoveryId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data || !data.authorId) return;
  
  await regeneratePortfolioForUser(data.authorId);
});

// Trigger on course enrollment changes
exports.onCourseEnrollmentWritten = onDocumentWritten('courseEnrollments/{enrollmentId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data || !data.userId || data.status !== 'COMPLETED') return;
  
  await regeneratePortfolioForUser(data.userId);
});

// Trigger on marketplace item changes
exports.onMarketplaceItemWritten = onDocumentWritten('marketplaceItems/{itemId}', async (event) => {
  const data = event.data && event.data.after ? event.data.after.data() : null;
  if (!data || !data.creatorId) return;
  
  await regeneratePortfolioForUser(data.creatorId);
});

// Backblaze B2 Media Storage API & Scheduled Cleanup
const mediaFunctions = require('./mediaApi');
exports.mediaApi = mediaFunctions.mediaApi;
exports.cleanupStaleUploads = mediaFunctions.cleanupStaleUploads;

// Scheduled cleanup for chat messages older than 7 days
exports.cleanupOldChatMessages = onSchedule('every 24 hours', async () => {
  const db = admin.firestore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago

  const DEFAULT_ROOM_IDS = [
    'general',
    'announcements',
    'questions',
    'help',
    'resources',
    'ideas',
    'feedback',
    'projects',
    'research',
    'random',
    'introductions',
    'events',
    'challenges',
    'media-sharing',
    'career-advice',
    'experiments',
    'products',
    'coding',
    'science'
  ];

  try {
    console.log('[Chat Cleanup] Starting cleanup of messages older than 7 days (cutoff:', cutoffDate.toISOString(), ')...');

    // Get all custom chat rooms in addition to default rooms
    const roomsSnapshot = await db.collection('chatRooms').get();
    const allRoomIds = Array.from(new Set([
      ...DEFAULT_ROOM_IDS,
      ...roomsSnapshot.docs.map(doc => doc.id)
    ]));

    let totalDeleted = 0;

    // 1. Process room by room
    for (const roomId of allRoomIds) {
      try {
        let hasMore = true;
        while (hasMore) {
          const oldMessages = await db
            .collection('chatRooms')
            .doc(roomId)
            .collection('messages')
            .where('createdAt', '<', cutoffDate)
            .limit(500)
            .get();

          if (oldMessages.empty) {
            hasMore = false;
            break;
          }

          const batch = db.batch();
          for (const doc of oldMessages.docs) {
            batch.delete(doc.ref);
          }

          await batch.commit();
          totalDeleted += oldMessages.size;
          console.log(`[Chat Cleanup] Deleted batch of ${oldMessages.size} messages from room #${roomId}`);

          if (oldMessages.size < 500) {
            hasMore = false;
          }
        }
      } catch (roomError) {
        console.warn(`[Chat Cleanup] Note for room ${roomId}:`, roomError.message);
      }
    }

    // 2. Global collectionGroup fallback to catch any orphaned/nested message subcollections
    try {
      let groupHasMore = true;
      while (groupHasMore) {
        const groupMessages = await db
          .collectionGroup('messages')
          .where('createdAt', '<', cutoffDate)
          .limit(500)
          .get();

        if (groupMessages.empty) {
          groupHasMore = false;
          break;
        }

        const batch = db.batch();
        for (const doc of groupMessages.docs) {
          batch.delete(doc.ref);
        }
        await batch.commit();
        totalDeleted += groupMessages.size;
        console.log(`[Chat Cleanup] Deleted global batch of ${groupMessages.size} old messages`);

        if (groupMessages.size < 500) {
          groupHasMore = false;
        }
      }
    } catch (groupError) {
      console.warn('[Chat Cleanup] CollectionGroup check:', groupError.message);
    }

    console.log(`[Chat Cleanup] Completed successfully. Total messages deleted: ${totalDeleted}`);
    return null;

  } catch (error) {
    console.error('[Chat Cleanup] Fatal error:', error);
    throw error;
  }
});

