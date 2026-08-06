/* eslint-disable */
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
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
      db.collection('courseEnrollments').where('userId', '==', uid).where('status', '==', 'COMPLETED').get(),
      db.collection('tutorials').where('authorId', '==', uid).where('status', '==', 'PUBLISHED').get(),
      db.collection('knowledgeArticles').where('authorId', '==', uid).where('status', '==', 'PUBLISHED').get(),
      db.collection('ventures').where('founderId', '==', uid).get(),
      db.collection('ventures').where('memberIds', 'array-contains', uid).get(),
      db.collection('userLearning').where('userId', '==', uid).get(),
      db.collection('learningPaths').where('status', '==', 'PUBLISHED').get(),
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
    const completedCourses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const authoredTutorials = tutorialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const publishedArticles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const foundedVentures = foundedVenturesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const joinedVentures = joinedVenturesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.founderId !== uid);
    const successfulVentures = [...foundedVentures, ...joinedVentures].filter(v => v.stage === 'SUCCESSFUL');
    const userLearning = userLearningSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const learningPaths = learningPathsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  const data = event.data.after.data;
  if (!data || !data.memberIds) return;
  
  for (const uid of data.memberIds) {
    await regeneratePortfolioForUser(uid);
  }
});

// Trigger on certificate changes
exports.onCertificateWritten = onDocumentWritten('certificates/{certificateId}', async (event) => {
  const data = event.data.after.data;
  if (!data || !data.userId) return;
  
  await regeneratePortfolioForUser(data.userId);
});

// Trigger on venture changes
exports.onVentureWritten = onDocumentWritten('ventures/{ventureId}', async (event) => {
  const data = event.data.after.data;
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
  const data = event.data.after.data;
  if (!data || !data.authorId) return;
  
  await regeneratePortfolioForUser(data.authorId);
});

// Trigger on course enrollment changes
exports.onCourseEnrollmentWritten = onDocumentWritten('courseEnrollments/{enrollmentId}', async (event) => {
  const data = event.data.after.data;
  if (!data || !data.userId || data.status !== 'COMPLETED') return;
  
  await regeneratePortfolioForUser(data.userId);
});

// Trigger on marketplace item changes
exports.onMarketplaceItemWritten = onDocumentWritten('marketplaceItems/{itemId}', async (event) => {
  const data = event.data.after.data;
  if (!data || !data.creatorId) return;
  
  await regeneratePortfolioForUser(data.creatorId);
});
