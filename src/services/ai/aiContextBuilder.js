import { hasPermission } from '../firebase/permissions';
import { AIMemoryService } from './aiMemory';
import { UniverseService } from '../firebase/universe';
import { getDoc, doc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

// BeastBuck Ecosystem Knowledge Base
const BEASTBUCK_KNOWLEDGE = `
BEASTBUCK ORGANIZATION OVERVIEW:
BeastBuck is a kid-friendly creative company OS where young creators can experiment, build products, complete missions, earn XP, and showcase their work.

CORE PRODUCTS & SERVICES:
1. NAM (Neural Architecture Mapper) - AI-powered system for mapping and understanding complex systems
2. FunFlicks - Creative video/content platform for young creators
3. Experiments - Science experiment tracking and management system
4. Universe OS - Intelligence layer for personal growth, goals, and recommendations
5. Products - Product development and marketplace
6. Academy - Learning platform with courses and skills
7. Research - Research and knowledge management
8. Organization OS - Team management, governance, and operations

ORGANIZATION STRUCTURE:
- Roles: Main CEO, Co-CEO, Leader, Member, User
- Departments: Research, Development, Marketing, Operations
- Teams: Cross-functional project teams
- Governance: Decision-making processes and approvals

KEY CONCEPTS:
- XP (Experience Points) - Earned through completing missions and tasks
- Missions - Structured tasks with objectives and rewards
- Experiments - Scientific tests with hypotheses, procedures, and results
- Projects - Larger initiatives with milestones and deliverables
- Skills - Member capabilities and specializations
- Reputation - Member standing in the community

WORKFLOW:
1. Users create accounts and can apply for membership
2. Members can join teams, work on projects, and complete missions
3. Experiments are conducted with proper documentation
4. Products are developed and launched
5. Skills are tracked and showcased
6. XP and reputation grow through contributions

PERMISSIONS & ACCESS:
- Public visitors can browse experiments and products
- Members can participate in projects and missions
- Leaders can manage teams and assign tasks
- CEOs have full organizational access
- Role-based access control enforced throughout
`;

export const AIContextBuilder = {
  buildContext: (user, roleData, currentPageData) => {
    if (!user) return "User is not logged in.";
    
    let context = `Context Data for User ID: ${user.uid}\n`;
    context += `User Role: ${roleData?.role || 'MEMBER'}\n`;
    context += `Membership Status: ${roleData?.membershipStatus || 'none'}\n`;
    
    // Strict permission enforcement: Never leak CEO data to non-CEOs
    const isCeo = hasPermission(roleData?.role, 'canAccessCeoPanel');
    if (!isCeo) {
      context += `Constraint: You must NOT reveal or suggest any CEO-level metrics, global organization hidden statuses, or executive alerts to this user.\n`;
    } else {
      context += `Note: User has CEO-level access. You may discuss global organizational health, alerts, and cross-departmental metrics.\n`;
    }
    
    // Inject page-specific context
    if (currentPageData) {
      if (currentPageData.type === 'project') {
        context += `Current Page Context (Project):\nTitle: ${currentPageData.data?.title || 'Unknown'}\nDescription: ${currentPageData.data?.description || 'None'}\nStatus: ${currentPageData.data?.status || 'Unknown'}\n`;
      } else if (currentPageData.type === 'task') {
        context += `Current Page Context (Task):\nTitle: ${currentPageData.data?.title || 'Unknown'}\nDescription: ${currentPageData.data?.description || 'None'}\n`;
      } else if (currentPageData.type === 'academy') {
        context += `Current Page Context (Academy):\nCourse: ${currentPageData.data?.title || 'Unknown'}\n`;
      } else if (currentPageData.type === 'research') {
        context += `Current Page Context (Research):\nTopic: ${currentPageData.data?.title || 'Unknown'}\n`;
      } else if (currentPageData.type === 'universe') {
        context += `Current Page Context (Universe OS):\nUser is on the BeastBuck Universe intelligence layer.\n`;
        if (currentPageData.data?.question) {
          context += `Suggested question: ${currentPageData.data.question}\n`;
        }
      } else if (currentPageData.type === 'experiment') {
        context += `Current Page Context (Experiment):\nTitle: ${currentPageData.data?.title || 'Unknown'}\nHypothesis: ${currentPageData.data?.hypothesis || 'None'}\nStatus: ${currentPageData.data?.status || 'Unknown'}\n`;
      } else if (currentPageData.type === 'product') {
        context += `Current Page Context (Product):\nName: ${currentPageData.data?.name || 'Unknown'}\nDescription: ${currentPageData.data?.description || 'None'}\nStatus: ${currentPageData.data?.status || 'Unknown'}\n`;
      }
    }
    
    return context;
  },

  async buildUniverseContext(uid) {
    if (!uid) return '';
    try {
      const [memory, interests, goals, journey, recs] = await Promise.all([
        AIMemoryService.getMemory(uid),
        UniverseService.getMemberInterests(uid),
        UniverseService.getMemberGoals(uid),
        UniverseService.getMemberJourney(uid),
        UniverseService.getRecommendations(uid, { limitCount: 5 }),
      ]);

      if (memory?.enabled === false) {
        return 'Universe context: AI memory is disabled for this user.\n';
      }

      const safeMemory = memory?.preferences || memory?.interests
        ? `Preferences: ${JSON.stringify(memory.preferences || {})}\nInterests: ${(memory.interests || []).join(', ')}\nFocus: ${(memory.currentFocus || []).join(', ')}\n`
        : memory?.data
          ? `User notes (non-sensitive): ${Object.entries(memory.data).slice(0, 8).map(([k, v]) => `${k}: ${v}`).join('; ')}\n`
          : '';

      const goalSummary = goals.slice(0, 5).map(g => `${g.type}: ${g.title} (${g.progress || 0}%)`).join('; ');
      const milestoneCount = Object.keys(journey.milestones || {}).length;
      const recSummary = recs.map(r => `${r.type}: ${r.title}`).join('; ');

      return [
        'BeastBuck Universe Intelligence:',
        safeMemory,
        `Interest topics: ${(interests.topics || []).join(', ') || 'none set'}`,
        `Active goals: ${goalSummary || 'none'}`,
        `Journey milestones recorded: ${milestoneCount}`,
        `Top recommendations: ${recSummary || 'none'}`,
        'Do not store or repeat sensitive personal information.',
      ].join('\n');
    } catch {
      return '';
    }
  },

  async buildOrganizationalContext(uid, roleData) {
    if (!uid) return '';
    try {
      // Get user's team assignments
      const teamsQuery = query(
        collection(db, 'teams'),
        where('members', 'array-contains', uid),
        limit(5)
      );
      const teamsSnap = await getDocs(teamsQuery);
      const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get user's active projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('assignedTo', '==', uid),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );
      const projectsSnap = await getDocs(projectsQuery);
      const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get recent experiments
      const experimentsQuery = query(
        collection(db, 'experiments'),
        where('createdBy', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const experimentsSnap = await getDocs(experimentsQuery);
      const experiments = experimentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let context = '\n\nORGANIZATIONAL CONTEXT:\n';
      
      if (teams.length > 0) {
        context += `Teams: ${teams.map(t => t.name).join(', ')}\n`;
      }
      
      if (projects.length > 0) {
        context += `Active Projects: ${projects.map(p => `${p.title} (${p.status})`).join('; ')}\n`;
      }
      
      if (experiments.length > 0) {
        context += `Recent Experiments: ${experiments.map(e => `${e.title} (${e.status})`).join('; ')}\n`;
      }

      return context;
    } catch (error) {
      console.error('Error building organizational context:', error);
      return '';
    }
  },

  async buildKnowledgeBaseContext() {
    try {
      // Get recent knowledge entries
      const knowledgeQuery = query(
        collection(db, 'aiKnowledge'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const knowledgeSnap = await getDocs(knowledgeQuery);
      const knowledge = knowledgeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (knowledge.length === 0) {
        return '';
      }

      let context = '\n\nORGANIZATION KNOWLEDGE BASE:\n';
      knowledge.forEach(k => {
        context += `- ${k.title}: ${k.content.substring(0, 200)}...\n`;
      });

      return context;
    } catch (error) {
      console.error('Error building knowledge base context:', error);
      return '';
    }
  },

  async buildFullContext(user, roleData, currentPageData) {
    const base = AIContextBuilder.buildContext(user, roleData, currentPageData);
    const universe = await AIContextBuilder.buildUniverseContext(user?.uid);
    const org = await AIContextBuilder.buildOrganizationalContext(user?.uid, roleData);
    const knowledge = await AIContextBuilder.buildKnowledgeBaseContext();

    return [
      BEASTBUCK_KNOWLEDGE,
      base,
      universe,
      org,
      knowledge
    ].filter(Boolean).join('\n\n');
  },
};
