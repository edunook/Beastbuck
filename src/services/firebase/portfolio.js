import { db } from './config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { UsersService } from './users';
import { CertificateService } from './certificates';
import { getSpecializationById } from '../../constants/specializations';
import { OrganizationService } from './organization';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const PortfolioService = {
  async getPortfolioData(username) {
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
  }
};
