/**
 * Script to regenerate all member portfolios
 * Run with: node scripts/regeneratePortfolios.cjs
 * Requires: service account key at service-account.json
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
let serviceAccountPath = path.join(__dirname, '..', '..', 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
}
if (!fs.existsSync(serviceAccountPath) && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: service-account.json not found. Please download it from Firebase Console and place it in the project root.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

async function getUidForUsername(username) {
  const usersSnap = await db.collection('users').where('username', '==', username).get();
  if (usersSnap.empty) return null;
  return usersSnap.docs[0].id;
}

async function getPortfolioData(username) {
  const uid = await getUidForUsername(username);
  if (!uid) throw new Error('User not found');

  const [
    userSnap,
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
  ] = await Promise.all([
    db.collection('users').doc(uid).get(),
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
  ]);

  const profile = userSnap.data();
  const allProjects = docsFrom(projectsSnap);
  const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
  const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
  const inventions = allProjects.filter(p => p.projectType === 'INVENTION');
  const prototypes = allProjects.filter(p => p.projectType === 'PROTOTYPE');
  const experiments = docsFrom(experimentsSnap);
  const products = docsFrom(productsSnap);
  const discoveries = docsFrom(discoveriesSnap);
  const completedCourses = docsFrom(coursesSnap);
  const authoredTutorials = docsFrom(tutorialsSnap);
  const publishedArticles = docsFrom(articlesSnap);
  const foundedVentures = docsFrom(foundedVenturesSnap);
  const joinedVentures = docsFrom(joinedVenturesSnap).filter(v => v.founderId !== uid);
  const successfulVentures = [...foundedVentures, ...joinedVentures].filter(v => v.stage === 'SUCCESSFUL');
  const userLearning = docsFrom(userLearningSnap);
  const learningPaths = docsFrom(learningPathsSnap);
  const marketplaceResources = docsFrom(marketplaceResourcesSnap);
  const marketplaceCollections = docsFrom(marketplaceCollectionsSnap);
  const marketplaceDownloads = docsFrom(marketplaceDownloadsSnap);

  // Get certificates
  const certificatesSnap = await db.collection('certificates').where('userId', '==', uid).get();
  const certificates = docsFrom(certificatesSnap);

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

  return {
    uid,
    profile,
    stats,
    projects,
    researchProjects,
    inventions,
    prototypes,
    experiments,
    products,
    certificates,
    discoveries,
    completedCourses,
    authoredTutorials,
    publishedArticles,
    foundedVentures,
    joinedVentures,
    successfulVentures,
    userLearning,
    learningPaths,
    marketplaceResources,
    marketplaceCollections,
    affiliations: [],
  };
}

async function generateAndStorePortfolio(username) {
  const portfolioData = await getPortfolioData(username);
  const portfolioDoc = {
    username: portfolioData.profile.username,
    displayName: portfolioData.profile.displayName,
    avatar: portfolioData.profile.avatar,
    role: portfolioData.profile.role,
    level: portfolioData.stats.level,
    totalXP: portfolioData.stats.totalXP,
    projectsCount: portfolioData.stats.projectsJoined,
    certificatesCount: portfolioData.stats.certificatesEarned,
    achievementsCount: portfolioData.stats.achievementsEarned,
    researchProjectsCount: portfolioData.stats.researchProjectsCount,
    inventionsCount: portfolioData.stats.inventionsCount,
    discoveriesCount: portfolioData.stats.discoveriesCount,
    prototypesCount: portfolioData.stats.prototypesCount,
    foundedVenturesCount: portfolioData.stats.foundedVenturesCount,
    joinedVenturesCount: portfolioData.stats.joinedVenturesCount,
    completedCoursesCount: portfolioData.stats.completedCoursesCount,
    skillNodesUnlocked: portfolioData.stats.skillNodesUnlocked,
    publishedResourcesCount: portfolioData.stats.publishedResourcesCount,
    marketplaceDownloadsCount: portfolioData.stats.marketplaceDownloadsCount,
    creatorRating: portfolioData.stats.creatorRating,
    projects: portfolioData.projects,
    researchProjects: portfolioData.researchProjects,
    inventions: portfolioData.inventions,
    prototypes: portfolioData.prototypes,
    discoveries: portfolioData.discoveries,
    certificates: portfolioData.certificates,
    foundedVentures: portfolioData.foundedVentures,
    joinedVentures: portfolioData.joinedVentures,
    successfulVentures: portfolioData.successfulVentures,
    completedCourses: portfolioData.completedCourses,
    learningPaths: portfolioData.learningPaths,
    userLearning: portfolioData.userLearning,
    marketplaceResources: portfolioData.marketplaceResources,
    marketplaceCollections: portfolioData.marketplaceCollections,
    affiliations: portfolioData.affiliations,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('portfolios').doc(username).set(portfolioDoc, { merge: true });
  
  return portfolioDoc;
}

async function regenerateAllPortfolios() {
  console.log('Starting portfolio regeneration...');
  
  try {
    const usersSnap = await db.collection('users').get();
    const users = docsFrom(usersSnap);
    
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          await generateAndStorePortfolio(user.username);
          return { username: user.username, success: true };
        } catch (err) {
          console.error(`Failed to generate portfolio for ${user.username}:`, err);
          return { username: user.username, success: false, error: err.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
    
    console.log(`\nPortfolio regeneration complete:`);
    console.log(`✓ Successful: ${successful.length}`);
    console.log(`✗ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\nFailed portfolios:');
      failed.forEach(f => {
        if (f.status === 'rejected') {
          console.log(`  - ${f.reason?.username || 'unknown'}: ${f.reason?.error || 'Unknown error'}`);
        } else {
          console.log(`  - ${f.value.username}: ${f.value.error}`);
        }
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error regenerating portfolios:', error);
    process.exit(1);
  }
}

regenerateAllPortfolios();
