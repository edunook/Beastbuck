import { db } from '@services/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { UsersService } from './users';
import { CertificateService } from './certificates';
import { getSpecializationById } from '@shared/constants/specializations';
import { OrganizationService } from './organization';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

// Stats Aggregator Engine - Helper for aggregating counts
export const StatsAggregator = {
  async aggregateUserStats(uid) {
    const [
      projectsSnap,
      experimentsSnap,
      productsSnap,
      discoveriesSnap,
      certificatesSnap,
      activitySnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'experiments'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'products'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'discoveries'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'certificates'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'activityLogs'), where('userId', '==', uid), limit(100))),
    ]);

    const allProjects = docsFrom(projectsSnap);
    const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
    const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
    const experiments = docsFrom(experimentsSnap);
    const products = docsFrom(productsSnap);
    const discoveries = docsFrom(discoveriesSnap);
    const certificates = docsFrom(certificatesSnap);
    const activity = docsFrom(activitySnap).sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Calculate Impact Score based on contributions
    const impactScore = this.calculateImpactScore({
      projects: projects.length,
      research: researchProjects.length,
      experiments: experiments.length,
      products: products.length,
      discoveries: discoveries.length,
      certificates: certificates.length,
      activity: activity.length,
    });

    return {
      projects: projects.length,
      research: researchProjects.length,
      experiments: experiments.length,
      products: products.length,
      discoveries: discoveries.length,
      certificates: certificates.length,
      impact: impactScore,
    };
  },

  calculateImpactScore(contributions) {
    // Weighted impact score calculation
    const weights = {
      projects: 10,
      research: 15,
      experiments: 8,
      products: 12,
      discoveries: 20,
      certificates: 5,
      activity: 1,
    };

    return (
      (contributions.projects * weights.projects) +
      (contributions.research * weights.research) +
      (contributions.experiments * weights.experiments) +
      (contributions.products * weights.products) +
      (contributions.discoveries * weights.discoveries) +
      (contributions.certificates * weights.certificates) +
      (contributions.activity * weights.activity)
    );
  },
};

export const PortfolioService = {
  async regeneratePortfolio(username) {
    const uid = await UsersService.getUidForUsername(username);
    if (!uid) throw new Error('User not found');

    const [
      userSnap,
      projectsSnap,
      experimentsSnap,
      productsSnap,
      discoveriesSnap,
      coursesSnap,
      foundedVenturesSnap,
      joinedVenturesSnap,
      userLearningSnap,
      learningPathsSnap,
      marketplaceResourcesSnap,
      marketplaceCollectionsSnap,
      marketplaceDownloadsSnap,
      certificatesSnap,
    ] = await Promise.all([
      UsersService.getUserProfile(uid),
      getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'experiments'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'products'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'discoveries'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'courseEnrollments'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('founderId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'userLearning'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'learningPaths'))),
      getDocs(query(collection(db, 'marketplaceItems'), where('creatorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceCollections'), where('creatorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceDownloads'), where('creatorId', '==', uid))),
      getDocs(query(collection(db, 'certificates'), where('userId', '==', uid))),
    ]);

    const profile = userSnap;
    const allProjects = docsFrom(projectsSnap);
    const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
    const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
    const inventions = allProjects.filter(p => p.projectType === 'INVENTION');
    const prototypes = allProjects.filter(p => p.projectType === 'PROTOTYPE');
    const experiments = docsFrom(experimentsSnap);
    const products = docsFrom(productsSnap);
    const discoveries = docsFrom(discoveriesSnap);
    const completedCourses = docsFrom(coursesSnap).filter(course => course.status === 'COMPLETED');
    const foundedVentures = docsFrom(foundedVenturesSnap);
    const joinedVentures = docsFrom(joinedVenturesSnap).filter(v => v.founderId !== uid);
    const successfulVentures = [...foundedVentures, ...joinedVentures].filter(v => v.stage === 'SUCCESSFUL');
    const userLearning = docsFrom(userLearningSnap);
    const learningPaths = docsFrom(learningPathsSnap).filter(path => path.status === 'PUBLISHED');
    const marketplaceResources = docsFrom(marketplaceResourcesSnap);
    const marketplaceCollections = docsFrom(marketplaceCollectionsSnap);
    const marketplaceDownloads = docsFrom(marketplaceDownloadsSnap);
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

    const assignedIds = Array.isArray(profile?.specializations) ? profile.specializations : [];
    const specializations = assignedIds.map(id => getSpecializationById(id)).filter(Boolean);

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
      specializations,
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

    await setDoc(doc(db, 'portfolios', username), portfolioDoc, { merge: true });
    return portfolioDoc;
  },

  async getPortfolioData(username) {
    // Always get fresh data from user profile - this ensures profile and portfolio are synced
    const uid = await UsersService.getUidForUsername(username);
    if (!uid) throw new Error('User not found');

    const [
      userSnap,
      projectsSnap,
      experimentsSnap,
      productsSnap,
      activitySnap,
      certificates,
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
      affiliations,
    ] = await Promise.all([
      UsersService.getUserProfile(uid),
      getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'experiments'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'products'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'activityLogs'), where('userId', '==', uid), limit(50))),
      CertificateService.getUserCertificates(uid),
      getDocs(query(collection(db, 'discoveries'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'courseEnrollments'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'tutorials'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'knowledgeArticles'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('founderId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'userLearning'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'learningPaths'))),
      getDocs(query(collection(db, 'marketplaceResources'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceCollections'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceDownloads'), where('userId', '==', uid))),
      OrganizationService.getUserAffiliations(uid),
    ]);

    const profile = userSnap;
    const allProjects = docsFrom(projectsSnap);
    const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
    const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
    const inventions = allProjects.filter(p => p.projectType === 'INVENTION');
    const prototypes = allProjects.filter(p => p.projectType === 'PROTOTYPE');
    const experiments = docsFrom(experimentsSnap);
    const products = docsFrom(productsSnap);
    const activity = docsFrom(activitySnap).sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return bTime - aTime;
    });
    const discoveries = docsFrom(discoveriesSnap);
    const completedCourses = docsFrom(coursesSnap).filter(course => course.status === 'COMPLETED');
    const authoredTutorials = docsFrom(tutorialsSnap).filter(tutorial => tutorial.status === 'PUBLISHED');
    const publishedArticles = docsFrom(articlesSnap).filter(article => article.status === 'PUBLISHED');
    const foundedVentures = docsFrom(foundedVenturesSnap);
    const joinedVentures = docsFrom(joinedVenturesSnap).filter(v => v.founderId !== uid);
    const successfulVentures = [...foundedVentures, ...joinedVentures].filter(v => v.stage === 'SUCCESSFUL');
    const userLearning = docsFrom(userLearningSnap);
    const learningPaths = docsFrom(learningPathsSnap).filter(path => path.status === 'PUBLISHED');
    const marketplaceResources = docsFrom(marketplaceResourcesSnap);
    const marketplaceCollections = docsFrom(marketplaceCollectionsSnap);
    const marketplaceDownloads = docsFrom(marketplaceDownloadsSnap);

    // Compute stats
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

    // Extract specializations
    const assignedIds = Array.isArray(profile?.specializations) ? profile.specializations : [];
    const specializations = assignedIds.map(id => getSpecializationById(id)).filter(Boolean);

    return {
      uid,
      // Include the full profile to ensure sync
      ...profile,
      profile,
      stats,
      projects,
      researchProjects,
      inventions,
      prototypes,
      experiments,
      products,
      activity,
      certificates,
      discoveries,
      specializations,
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
      marketplaceDownloads,
      affiliations,
    };
  },

  async getAllMembersPortfolios() {
    // Try to get pre-generated portfolios first
    try {
      const portfoliosSnap = await getDocs(query(collection(db, 'portfolios'), orderBy('totalXP', 'desc')));
      if (!portfoliosSnap.empty) {
        return docsFrom(portfoliosSnap);
      }
    } catch (err) {
      console.error('Failed to get pre-generated portfolios, falling back to dynamic generation:', err);
    }

    // Fallback to dynamic generation
    const usersSnap = await getDocs(query(collection(db, 'users')));
    const users = docsFrom(usersSnap);
    
    const portfolios = await Promise.all(
      users.map(async (user) => {
        try {
          const portfolioData = await this.getPortfolioData(user.username);
          return {
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            role: user.role,
            level: portfolioData.stats.level,
            totalXP: portfolioData.stats.totalXP,
            projectsCount: portfolioData.stats.projectsJoined,
            certificatesCount: portfolioData.stats.certificatesEarned,
            achievementsCount: portfolioData.stats.achievementsEarned,
          };
        } catch (err) {
          console.error(`Failed to load portfolio for ${user.username}:`, err);
          return null;
        }
      })
    );

    return portfolios.filter(Boolean).sort((a, b) => b.totalXP - a.totalXP);
  },

  async generateAndStorePortfolio(username) {
    const portfolioData = await this.getPortfolioData(username);
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
      specializations: portfolioData.specializations,
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

    const portfolioRef = doc(db, 'portfolios', username);
    await setDoc(portfolioRef, portfolioDoc, { merge: true });
    
    return portfolioDoc;
  },

  async regenerateAllPortfolios() {
    const usersSnap = await getDocs(query(collection(db, 'users')));
    const users = docsFrom(usersSnap);
    
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          await this.generateAndStorePortfolio(user.username);
          return { username: user.username, success: true };
        } catch (err) {
          console.error(`Failed to generate portfolio for ${user.username}:`, err);
          return { username: user.username, success: false, error: err.message };
        }
      })
    );

    return results;
  },

  async getUserPortfolio(uid) {
    try {
      const portfolioDoc = await getDoc(doc(db, 'portfolios', uid));
      if (portfolioDoc.exists()) {
        return portfolioDoc.data();
      }
      
      // If no portfolio exists, create one with default privacy settings
      const defaultPortfolio = {
        uid,
        privacy: {
          showProjects: true,
          showResearch: true,
          showAchievements: true,
          showStats: true,
        },
        stats: await StatsAggregator.aggregateUserStats(uid),
        projects: [],
        research: [],
        achievements: [],
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'portfolios', uid), defaultPortfolio);
      return defaultPortfolio;
    } catch (err) {
      console.error('Failed to get user portfolio:', err);
      throw err;
    }
  },

  async updatePrivacySettings(uid, privacySettings) {
    try {
      const portfolioRef = doc(db, 'portfolios', uid);
      await updateDoc(portfolioRef, {
        privacy: privacySettings,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
      throw err;
    }
  },

  // Share Analytics Tracking
  async trackShareEvent(uid, shareType, platform = null) {
    try {
      const shareRef = doc(db, 'portfolios', uid);
      await updateDoc(shareRef, {
        totalShares: increment(1),
        [`shareStats.${shareType}`]: increment(1),
        lastSharedAt: serverTimestamp(),
      });

      // Track platform-specific shares
      if (platform) {
        await updateDoc(shareRef, {
          [`shareStats.platforms.${platform}`]: increment(1),
        });
      }

      // Log share event for analytics
      const shareLogRef = doc(collection(db, 'shareLogs'));
      await setDoc(shareLogRef, {
        userId: uid,
        shareType,
        platform,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to track share event:', err);
      throw err;
    }
  },

  async getShareAnalytics(uid) {
    try {
      const portfolioDoc = await getDoc(doc(db, 'portfolios', uid));
      if (!portfolioDoc.exists()) {
        return null;
      }

      const portfolio = portfolioDoc.data();
      return {
        totalShares: portfolio.totalShares || 0,
        shareStats: portfolio.shareStats || {
          link: 0,
          qr: 0,
          pdf: 0,
          print: 0,
          platforms: {
            linkedin: 0,
            twitter: 0,
            facebook: 0,
            email: 0,
          },
        },
        lastSharedAt: portfolio.lastSharedAt || null,
      };
    } catch (err) {
      console.error('Failed to get share analytics:', err);
      throw err;
    }
  },

  async getShareHistory(uid, limitCount = 50) {
    try {
      const shareLogsQuery = query(
        collection(db, 'shareLogs'),
        where('userId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const shareLogsSnap = await getDocs(shareLogsQuery);
      return docsFrom(shareLogsSnap);
    } catch (err) {
      console.error('Failed to get share history:', err);
      throw err;
    }
  },
};
