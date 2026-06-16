import { db } from './config';
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
} from 'firebase/firestore';
import { UsersService } from './users';
import { CertificateService } from './certificates';
import { getSpecializationById } from '../../constants/specializations';
import { OrganizationService } from './organization';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

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
      UsersService.getUserProfile(uid),
      getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'experiments'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'products'), where('authors', 'array-contains', uid))),
      getDocs(query(collection(db, 'discoveries'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'courseEnrollments'), where('userId', '==', uid), where('status', '==', 'COMPLETED'))),
      getDocs(query(collection(db, 'tutorials'), where('authorId', '==', uid), where('status', '==', 'PUBLISHED'))),
      getDocs(query(collection(db, 'knowledgeArticles'), where('authorId', '==', uid), where('status', '==', 'PUBLISHED'))),
      getDocs(query(collection(db, 'ventures'), where('founderId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'userLearning'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'learningPaths'), where('status', '==', 'PUBLISHED'))),
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
    // Try to get pre-generated portfolio first
    try {
      const portfolioSnap = await getDocs(query(collection(db, 'portfolios'), where('username', '==', username)));
      if (!portfolioSnap.empty) {
        const portfolio = portfolioSnap.docs[0].data();
        return {
          profile: {
            username: portfolio.username,
            displayName: portfolio.displayName,
            avatar: portfolio.avatar,
            role: portfolio.role,
          },
          stats: {
            level: portfolio.level,
            totalXP: portfolio.totalXP,
            projectsJoined: portfolio.projectsCount,
            experimentsCreated: 0,
            productsCreated: 0,
            certificatesEarned: portfolio.certificatesCount,
            achievementsEarned: portfolio.achievementsCount,
            discoveriesCount: portfolio.discoveriesCount,
            inventionsCount: portfolio.inventionsCount,
            researchProjectsCount: portfolio.researchProjectsCount,
            prototypesCount: portfolio.prototypesCount,
            foundedVenturesCount: portfolio.foundedVenturesCount,
            joinedVenturesCount: portfolio.joinedVenturesCount,
            successfulVenturesCount: portfolio.successfulVentures?.length || 0,
            completedCoursesCount: portfolio.completedCoursesCount,
            skillNodesUnlocked: portfolio.skillNodesUnlocked,
            publishedResourcesCount: portfolio.publishedResourcesCount,
            marketplaceDownloadsCount: portfolio.marketplaceDownloadsCount,
            marketplaceCollectionsCount: portfolio.marketplaceCollections?.length || 0,
            creatorRating: portfolio.creatorRating,
          },
          projects: portfolio.projects || [],
          researchProjects: portfolio.researchProjects || [],
          inventions: portfolio.inventions || [],
          prototypes: portfolio.prototypes || [],
          experiments: [],
          products: [],
          activity: [],
          certificates: portfolio.certificates || [],
          discoveries: portfolio.discoveries || [],
          specializations: portfolio.specializations || [],
          completedCourses: portfolio.completedCourses || [],
          authoredTutorials: [],
          publishedArticles: [],
          foundedVentures: portfolio.foundedVentures || [],
          joinedVentures: portfolio.joinedVentures || [],
          successfulVentures: portfolio.successfulVentures || [],
          userLearning: portfolio.userLearning || [],
          learningPaths: portfolio.learningPaths || [],
          marketplaceResources: portfolio.marketplaceResources || [],
          marketplaceCollections: portfolio.marketplaceCollections || [],
          affiliations: portfolio.affiliations || [],
        };
      }
    } catch (err) {
      console.error('Failed to get pre-generated portfolio, falling back to dynamic generation:', err);
    }

    // Fallback to dynamic generation
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
      getDocs(query(collection(db, 'activityLogs'), where('userId', '==', uid), orderBy('timestamp', 'desc'), limit(50))),
      CertificateService.getUserCertificates(uid),
      getDocs(query(collection(db, 'discoveries'), where('authorId', '==', uid))),
      getDocs(query(collection(db, 'courseEnrollments'), where('userId', '==', uid), where('status', '==', 'COMPLETED'))),
      getDocs(query(collection(db, 'tutorials'), where('authorId', '==', uid), where('status', '==', 'PUBLISHED'))),
      getDocs(query(collection(db, 'knowledgeArticles'), where('authorId', '==', uid), where('status', '==', 'PUBLISHED'))),
      getDocs(query(collection(db, 'ventures'), where('founderId', '==', uid))),
      getDocs(query(collection(db, 'ventures'), where('memberIds', 'array-contains', uid))),
      getDocs(query(collection(db, 'userLearning'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'learningPaths'), where('status', '==', 'PUBLISHED'))),
      getDocs(query(collection(db, 'marketplaceItems'), where('creatorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceCollections'), where('creatorId', '==', uid))),
      getDocs(query(collection(db, 'marketplaceDownloads'), where('creatorId', '==', uid))),
      OrganizationService.getMemberAffiliations(uid),
    ]);

    const profile = userSnap;
    const allProjects = docsFrom(projectsSnap);
    const projects = allProjects.filter(p => p.projectType === 'STANDARD' || !p.projectType);
    const researchProjects = allProjects.filter(p => p.projectType === 'RESEARCH');
    const inventions = allProjects.filter(p => p.projectType === 'INVENTION');
    const prototypes = allProjects.filter(p => p.projectType === 'PROTOTYPE');
    const experiments = docsFrom(experimentsSnap);
    const products = docsFrom(productsSnap);
    const activity = docsFrom(activitySnap);
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
  }
};
