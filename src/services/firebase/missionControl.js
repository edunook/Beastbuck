import { db } from './config';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const MissionControlService = {
  // ---------------------------------------------------------------------------
  // GLOBAL SEARCH
  // ---------------------------------------------------------------------------
  async globalSearch(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    
    // We fetch a limited number of docs from each major collection for the search
    // In a real production app with millions of docs, we'd use Algolia or Typesense.
    // For this prototype, we'll fetch recently active items and filter client-side,
    // or rely on simple prefix queries if possible. Here we'll do a bounded fetch.
    
    const [users, projects, experiments, products, ventures, marketplaceItems, automations, departments, workspaces, documents] = await Promise.all([
      getDocs(query(collection(db, 'users'), limit(500))),
      getDocs(query(collection(db, 'projects'), limit(500))),
      getDocs(query(collection(db, 'experiments'), limit(500))),
      getDocs(query(collection(db, 'products'), limit(500))),
      getDocs(query(collection(db, 'ventures'), limit(500))),
      getDocs(query(collection(db, 'marketplaceItems'), limit(500))),
      getDocs(query(collection(db, 'automations'), limit(500))),
      getDocs(query(collection(db, 'departments'), limit(100))),
      getDocs(query(collection(db, 'workspaces'), limit(200))),
      getDocs(query(collection(db, 'documents'), limit(500))),
    ]);

    const results = [];

    docsFrom(users).forEach(u => {
      if ((u.displayName?.toLowerCase().includes(term)) || (u.username?.toLowerCase().includes(term))) {
        results.push({ type: 'user', id: u.id, title: u.displayName || u.username, subtitle: u.role, image: u.avatar, link: `/profile/${u.id}` });
      }
    });

    docsFrom(projects).forEach(p => {
      if (p.title?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)) {
        results.push({ type: 'project', id: p.id, title: p.title, subtitle: p.status, link: `/mission-control/projects` });
      }
    });

    docsFrom(experiments).forEach(e => {
      if (e.title?.toLowerCase().includes(term) || e.description?.toLowerCase().includes(term)) {
        results.push({ type: 'experiment', id: e.id, title: e.title, subtitle: e.status, link: `/workspace/experiments/${e.id}` });
      }
    });

    docsFrom(products).forEach(p => {
      if (p.title?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)) {
        results.push({ type: 'product', id: p.id, title: p.title, subtitle: p.status, link: `/workspace/products/${p.id}` });
      }
    });

    docsFrom(ventures).forEach(v => {
      if (v.title?.toLowerCase().includes(term) || v.description?.toLowerCase().includes(term) || v.problem?.toLowerCase().includes(term)) {
        results.push({ type: 'venture', id: v.id, title: v.title, subtitle: `${v.stage || 'IDEA'} · ${v.status || 'PENDING_REVIEW'}`, link: `/ventures/${v.id}` });
      }
    });

    docsFrom(marketplaceItems).forEach(item => {
      if (item.title?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term) || item.type?.toLowerCase().includes(term)) {
        results.push({ type: 'resource', id: item.id, title: item.title, subtitle: `${item.type || 'Resource'} · ${item.downloadCount || 0} downloads`, link: `/marketplace/${item.id}` });
      }
    });

    docsFrom(automations).forEach(item => {
      if (item.title?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term) || item.trigger?.toLowerCase().includes(term) || item.scope?.toLowerCase().includes(term)) {
        results.push({ type: 'automation', id: item.id, title: item.title, subtitle: `${item.scope || 'Platform'} · ${item.status || 'DRAFT'}`, link: '/automation' });
      }
    });

    docsFrom(departments).forEach(d => {
      if (d.name?.toLowerCase().includes(term)) {
        results.push({ type: 'department', id: d.id, title: d.name, subtitle: `${d.memberCount} members`, link: `/organization/${d.id}` });
      }
    });

    docsFrom(workspaces).forEach(w => {
      if (w.name?.toLowerCase().includes(term) || w.description?.toLowerCase().includes(term)) {
        results.push({ type: 'workspace', id: w.id, title: w.name, subtitle: 'Workspace', link: `/workspace/${w.id}` });
      }
    });

    docsFrom(documents).forEach(d => {
      // Very basic text search for content or title
      if (d.title?.toLowerCase().includes(term) || d.content?.toLowerCase().includes(term)) {
        results.push({ type: 'document', id: d.id, title: d.title || 'Untitled Document', subtitle: 'Workspace Document', link: `/workspace/${d.workspaceId}` });
      }
    });

    return results.slice(0, 50); // Return top 50 results
  },

  // ---------------------------------------------------------------------------
  // AGGREGATION & SNAPSHOTS
  // ---------------------------------------------------------------------------
  async generateAnalyticsSnapshot(actorId) {
    // Generate a point-in-time snapshot of the entire platform's health to avoid
    // real-time expensive queries later.
    const [users, projects, experiments, products, ventures, marketplaceItems, automations, workflowExecutions, workspaces] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'experiments')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'ventures')),
      getDocs(collection(db, 'marketplaceItems')),
      getDocs(collection(db, 'automations')),
      getDocs(collection(db, 'workflowExecutions')),
      getDocs(collection(db, 'workspaces')),
    ]);

    const memberList = docsFrom(users);
    const projectList = docsFrom(projects);

    const totalXP = memberList.reduce((sum, m) => sum + (m.xp || 0), 0);
    const activeProjects = projectList.filter(p => p.status === 'ACTIVE').length;

    const snapshot = {
      timestamp: serverTimestamp(),
      generatedBy: actorId,
      metrics: {
        totalMembers: memberList.length,
        totalProjects: projectList.length,
        activeProjects,
        totalExperiments: experiments.size,
        totalProducts: products.size,
        totalVentures: ventures.size,
        totalMarketplaceResources: marketplaceItems.size,
        totalAutomations: automations.size,
        totalWorkflowExecutions: workflowExecutions.size,
        totalWorkspaces: workspaces.size,
        totalXP,
      },
      departmentDistribution: {}, // Could aggregate members per department here
    };

    const id = new Date().toISOString().split('T')[0]; // Daily snapshot
    await setDoc(doc(db, 'analyticsSnapshots', id), snapshot, { merge: true });
    return snapshot;
  },

  async getAnalyticsSnapshots(limitCount = 30) {
    const snap = await getDocs(query(collection(db, 'analyticsSnapshots'), orderBy('timestamp', 'desc'), limit(limitCount)));
    return docsFrom(snap).reverse(); // Chronological order
  },

  // ---------------------------------------------------------------------------
  // PROJECT HEALTH (0-100 Score)
  // ---------------------------------------------------------------------------
  calculateProjectHealth(project) {
    let score = 100;
    
    // Progress factor
    if (project.progressPercent === 0 && project.status === 'ACTIVE') score -= 10;
    
    // Deadline factor
    if (project.targetDate) {
      const target = new Date(project.targetDate);
      const now = new Date();
      if (target < now && project.progressPercent < 100) {
        score -= 30; // Overdue
      } else if (target < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) && project.progressPercent < 80) {
        score -= 15; // Approaching deadline with low progress
      }
    }

    // Activity factor (penalize if no recent updates)
    const lastUpdate = project.updatedAt?.toDate ? project.updatedAt.toDate() : new Date(project.updatedAt || project.createdAt);
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 14 && project.status === 'ACTIVE') score -= 20;
    if (daysSinceUpdate > 30 && project.status === 'ACTIVE') score -= 20;

    // Task factor
    const tasks = project.tasks || [];
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const completionRate = completed / tasks.length;
      if (completionRate < 0.2 && daysSinceUpdate > 7) score -= 10;
    } else {
      score -= 5; // No tasks defined
    }

    // Status overrides
    if (project.status === 'ON_HOLD') score = Math.min(score, 50);
    if (project.status === 'COMPLETED') score = 100;

    score = Math.max(0, Math.min(100, score));

    let label = 'Healthy';
    if (score < 50) label = 'At Risk';
    else if (score < 80) label = 'Needs Attention';

    return { score, label };
  },

  async getProjectHealth() {
    const snap = await getDocs(query(collection(db, 'projects'), where('status', 'in', ['ACTIVE', 'ON_HOLD', 'PLANNING'])));
    const projects = docsFrom(snap);
    
    return projects.map(p => ({
      ...p,
      health: this.calculateProjectHealth(p)
    })).sort((a, b) => a.health.score - b.health.score); // Lowest score first
  },

  // ---------------------------------------------------------------------------
  // EXECUTIVE ALERTS
  // ---------------------------------------------------------------------------
  async getExecutiveAlerts() {
    const alerts = [];
    
    // 1. Pending Applications
    const appsSnap = await getDocs(query(collection(db, 'membershipApplications'), where('status', '==', 'PENDING')));
    if (!appsSnap.empty) {
      alerts.push({
        id: 'pending_apps',
        type: 'WARNING',
        title: 'Pending Applications',
        message: `${appsSnap.size} new membership applications await review.`,
        actionLink: '/ceo-panel',
      });
    }

    // 2. Overdue or At Risk Projects
    const projects = await this.getProjectHealth();
    const atRisk = projects.filter(p => p.health.label === 'At Risk');
    if (atRisk.length > 0) {
      alerts.push({
        id: 'at_risk_projects',
        type: 'DANGER',
        title: 'Projects At Risk',
        message: `${atRisk.length} active projects have a health score below 50 and require immediate intervention.`,
        actionLink: '/mission-control/projects',
      });
    }

    // 3. Stalled Experiments
    const expSnap = await getDocs(query(collection(db, 'experiments'), where('status', '==', 'IN_PROGRESS')));
    const stalledExp = docsFrom(expSnap).filter(e => {
      const lastUpdate = e.updatedAt?.toDate ? e.updatedAt.toDate() : new Date(e.createdAt);
      return (new Date() - lastUpdate) / (1000 * 60 * 60 * 24) > 30;
    });
    if (stalledExp.length > 0) {
      alerts.push({
        id: 'stalled_experiments',
        type: 'WARNING',
        title: 'Stalled Experiments',
        message: `${stalledExp.length} experiments have been in progress for over 30 days with no updates.`,
        actionLink: '/mission-control/departments',
      });
    }

    // 4. Venture risk
    const venturesSnap = await getDocs(collection(db, 'ventures'));
    const stalledVentures = docsFrom(venturesSnap).filter(v => {
      if (['SUCCESSFUL', 'ARCHIVED'].includes(v.stage) || v.status === 'ARCHIVED') return false;
      const lastUpdate = v.updatedAt?.toDate ? v.updatedAt.toDate() : new Date(v.createdAt || Date.now());
      return (new Date() - lastUpdate) / (1000 * 60 * 60 * 24) > 21;
    });
    if (stalledVentures.length > 0) {
      alerts.push({
        id: 'stalled_ventures',
        type: 'WARNING',
        title: 'Stalled Ventures',
        message: `${stalledVentures.length} ventures have not moved recently and may need mentors, tasks, or founder follow-up.`,
        actionLink: '/mission-control/ventures',
      });
    }

    // 5. Automation failures and pending approvals
    const [executionSnap, approvalSnap] = await Promise.all([
      getDocs(collection(db, 'workflowExecutions')),
      getDocs(collection(db, 'workflowApprovals')),
    ]);
    const failedExecutions = docsFrom(executionSnap).filter(item => item.status === 'FAILED');
    const pendingApprovals = docsFrom(approvalSnap).filter(item => item.status === 'PENDING');
    if (failedExecutions.length > 0 || pendingApprovals.length > 10) {
      alerts.push({
        id: 'automation_review',
        type: failedExecutions.length > 0 ? 'DANGER' : 'WARNING',
        title: 'Automation Review Needed',
        message: `${failedExecutions.length} failed workflow executions and ${pendingApprovals.length} pending approvals need leadership review.`,
        actionLink: '/mission-control/automation',
      });
    }

    return alerts;
  },

  // ---------------------------------------------------------------------------
  // MEMBER ANALYTICS
  // ---------------------------------------------------------------------------
  async getMemberAnalytics() {
    const snap = await getDocs(collection(db, 'users'));
    const members = docsFrom(snap);

    const now = new Date();
    
    // Top contributors (by XP)
    const topContributors = [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
    
    // Rising stars (High XP, joined recently)
    const risingStars = [...members].filter(m => {
      if (!m.joinedAt) return false;
      const joined = m.joinedAt.toDate ? m.joinedAt.toDate() : new Date(m.joinedAt);
      const days = (now - joined) / (1000 * 60 * 60 * 24);
      return days < 60 && (m.xp || 0) > 100;
    }).sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);

    // Inactive members (0 XP or very old update)
    const inactive = [...members].filter(m => {
      if (m.role === 'Pending Member' || m.suspended || m.removed) return false;
      const updated = m.updatedAt?.toDate ? m.updatedAt.toDate() : (m.joinedAt?.toDate ? m.joinedAt.toDate() : new Date());
      const days = (now - updated) / (1000 * 60 * 60 * 24);
      return days > 30 || (m.xp || 0) === 0;
    }).slice(0, 20);

    return { topContributors, risingStars, inactive, totalMembers: members.length };
  },

  // ---------------------------------------------------------------------------
  // DEPARTMENT / ORG HEALTH
  // ---------------------------------------------------------------------------
  async getOrganizationHealth() {
    const [deptsSnap, membersSnap, projectsSnap] = await Promise.all([
      getDocs(collection(db, 'departments')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
    ]);

    const departments = docsFrom(deptsSnap);
    const members = docsFrom(membersSnap);
    const projects = docsFrom(projectsSnap);

    return departments.map(dept => {
      const deptMembers = members.filter(m => m.departmentId === dept.id);
      const deptProjects = projects.filter(p => p.departmentId === dept.id);
      const activeProjects = deptProjects.filter(p => p.status === 'ACTIVE');
      const totalXP = deptMembers.reduce((sum, m) => sum + (m.xp || 0), 0);
      
      // Calculate avg project health
      const healthScores = activeProjects.map(p => this.calculateProjectHealth(p).score);
      const avgHealth = healthScores.length ? healthScores.reduce((a,b)=>a+b,0) / healthScores.length : 100;

      return {
        ...dept,
        memberCount: deptMembers.length,
        projectCount: deptProjects.length,
        activeProjectCount: activeProjects.length,
        totalXP,
        avgHealth: Math.round(avgHealth),
      };
    }).sort((a, b) => b.totalXP - a.totalXP);
  },

  // ---------------------------------------------------------------------------
  // INNOVATION HEALTH (Step 18)
  // ---------------------------------------------------------------------------
  async getInnovationHealth() {
    const [researchSnap, discoveriesSnap] = await Promise.all([
      getDocs(query(collection(db, 'projects'), where('projectType', 'in', ['RESEARCH', 'INVENTION', 'PROTOTYPE']))),
      getDocs(collection(db, 'discoveries')),
    ]);

    const allInnovationProjects = docsFrom(researchSnap);
    const discoveries = docsFrom(discoveriesSnap);

    const activeResearch = allInnovationProjects.filter(p => ['ACTIVE', 'PLANNING', 'IN_PROGRESS'].includes(p.status));
    const stalledResearch = allInnovationProjects.filter(p => {
      if (!['ACTIVE', 'IN_PROGRESS'].includes(p.status)) return false;
      const lastUpdate = p.updatedAt?.toDate ? p.updatedAt.toDate() : new Date(p.createdAt || Date.now());
      return (new Date() - lastUpdate) / (1000 * 60 * 60 * 24) > 21;
    });

    const prototypes = allInnovationProjects.filter(p => p.projectType === 'PROTOTYPE');
    const completedPrototypes = prototypes.filter(p => p.status === 'COMPLETED');
    const prototypeCompletionRate = prototypes.length > 0 ? Math.round((completedPrototypes.length / prototypes.length) * 100) : 0;

    const inventions = allInnovationProjects.filter(p => p.projectType === 'INVENTION');
    const researchProjects = allInnovationProjects.filter(p => p.projectType === 'RESEARCH');
    const approvedDiscoveries = discoveries.filter(d => ['APPROVED', 'FEATURED'].includes(d.status));

    return {
      totalInnovationProjects: allInnovationProjects.length,
      activeResearch: activeResearch.length,
      stalledResearch: stalledResearch.length,
      prototypeCompletionRate,
      inventionCount: inventions.length,
      discoveryCount: discoveries.length,
      approvedDiscoveries: approvedDiscoveries.length,
      researchProjectCount: researchProjects.length,
      // Health label
      innovationHealthLabel: stalledResearch.length > activeResearch.length * 0.3 ? 'Needs Attention' : 'Healthy',
    };
  },

  async getAcademyHealth() {
    const [
      coursesSnap,
      enrollmentsSnap,
      articlesSnap,
      tutorialsSnap,
      quizzesSnap,
      assignmentsSnap,
      submissionsSnap,
      certificationsSnap,
      skillTreesSnap,
      skillNodesSnap,
      userLearningSnap,
      analyticsSnap
    ] = await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'courseEnrollments')),
      getDocs(collection(db, 'knowledgeArticles')),
      getDocs(collection(db, 'tutorials')),
      getDocs(collection(db, 'quizAttempts')),
      getDocs(collection(db, 'assignments')),
      getDocs(collection(db, 'assignmentSubmissions')),
      getDocs(collection(db, 'certificates')),
      getDocs(collection(db, 'skillTrees')),
      getDocs(collection(db, 'skillNodes')),
      getDocs(collection(db, 'userLearning')),
      getDocs(collection(db, 'academyAnalytics')),
    ]);

    const courses = docsFrom(coursesSnap);
    const enrollments = docsFrom(enrollmentsSnap);
    const articles = docsFrom(articlesSnap);
    const tutorials = docsFrom(tutorialsSnap);
    const quizAttempts = docsFrom(quizzesSnap);
    const assignments = docsFrom(assignmentsSnap);
    const submissions = docsFrom(submissionsSnap);
    const certifications = docsFrom(certificationsSnap).filter(cert => cert.status === 'ACTIVE');
    const userLearning = docsFrom(userLearningSnap);
    const academyEvents = docsFrom(analyticsSnap);

    const activeEnrollments = enrollments.filter(e => e.status === 'IN_PROGRESS');
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED');
    const completionRate = enrollments.length > 0 ? Math.round((completedEnrollments.length / enrollments.length) * 100) : 0;
    
    const passedQuizzes = quizAttempts.filter(q => q.passed);
    const quizPassRate = quizAttempts.length > 0 ? Math.round((passedQuizzes.length / quizAttempts.length) * 100) : 0;
    const reviewedSubmissions = submissions.filter(s => s.status === 'REVIEWED');
    const assignmentReviewRate = submissions.length > 0 ? Math.round((reviewedSubmissions.length / submissions.length) * 100) : 0;
    const avgLearningVelocity = activeEnrollments.length > 0
      ? Math.round(activeEnrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / activeEnrollments.length)
      : 0;
    const knowledgeContributions = articles.filter(a => a.status === 'PUBLISHED').length + tutorials.filter(t => t.status === 'PUBLISHED').length;
    
    return {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'PUBLISHED').length,
      totalEnrollments: enrollments.length,
      activeLearners: activeEnrollments.length,
      courseCompletionRate: completionRate,
      learningVelocity: avgLearningVelocity,
      knowledgeArticlesCount: articles.length,
      tutorialsCount: tutorials.length,
      knowledgeContributions,
      totalQuizAttempts: quizAttempts.length,
      quizPassRate,
      assignmentsCount: assignments.length,
      assignmentSubmissionsCount: submissions.length,
      assignmentReviewRate,
      certificationCount: certifications.length,
      skillTreesCount: skillTreesSnap.size,
      skillNodesCount: skillNodesSnap.size,
      skillUnlocks: userLearning.filter(item => item.status === 'UNLOCKED').length,
      academyAnalyticsEvents: academyEvents.length,
      academyHealthLabel: completionRate > 50 && quizPassRate >= 50 ? 'Excellent' : 'Needs Engagement',
    };
  },

  // ---------------------------------------------------------------------------
  // WORKSPACE HEALTH (Step 22)
  // ---------------------------------------------------------------------------
  async getWorkspaceHealth() {
    const [
      workspacesSnap,
      documentsSnap,
      notebooksSnap,
      whiteboardsSnap,
      mindMapsSnap,
      membersSnap
    ] = await Promise.all([
      getDocs(collection(db, 'workspaces')),
      getDocs(collection(db, 'documents')),
      getDocs(collection(db, 'researchNotebooks')),
      getDocs(collection(db, 'whiteboards')),
      getDocs(collection(db, 'mindMaps')),
      getDocs(collection(db, 'workspaceMembers')),
    ]);

    const workspaces = docsFrom(workspacesSnap);
    const documents = docsFrom(documentsSnap);
    const notebooks = docsFrom(notebooksSnap);
    const members = docsFrom(membersSnap);

    const activeWorkspaces = workspaces.filter(w => {
       const lastUpdate = w.updatedAt?.toDate ? w.updatedAt.toDate() : new Date(w.createdAt || Date.now());
       return (new Date() - lastUpdate) / (1000 * 60 * 60 * 24) <= 30;
    });

    const activeDocuments = documents.filter(d => {
       const lastUpdate = d.lastEditedAt?.toDate ? d.lastEditedAt.toDate() : new Date(d.createdAt || Date.now());
       return (new Date() - lastUpdate) / (1000 * 60 * 60 * 24) <= 30;
    });

    const totalKnowledgeItems = documents.length + notebooks.length + whiteboardsSnap.size + mindMapsSnap.size;
    
    // Average members per workspace as collaboration rate proxy
    const collaborationRate = workspaces.length > 0 ? (members.length / workspaces.length).toFixed(1) : 0;

    return {
       totalWorkspaces: workspaces.length,
       activeWorkspaces: activeWorkspaces.length,
       totalDocuments: documents.length,
       activeDocuments: activeDocuments.length,
       activeNotebooks: notebooks.length, // Simplified for now
       collaborationRate,
       knowledgeCreationRate: totalKnowledgeItems,
       workspaceHealthLabel: activeWorkspaces.length > 0 ? 'Healthy' : 'Low Activity'
    };
  }
};
