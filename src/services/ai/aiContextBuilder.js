import { hasPermission } from '../firebase/permissions';
import { AIMemoryService } from './aiMemory';
import { UniverseService } from '../firebase/universe';
import { getDoc, doc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

// BeastBuck Ecosystem Knowledge Base
const BEASTBUCK_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════════════════════
BEASTBUCK - CREATIVE COMPANY OPERATING SYSTEM FOR YOUNG INNOVATORS
═══════════════════════════════════════════════════════════════════════════════

MISSION: Empower young creators to experiment, build, collaborate, and grow through a comprehensive creative company operating system.

═══════════════════════════════════════════════════════════════════════════════
ORGANIZATION STRUCTURE & ROLES
═══════════════════════════════════════════════════════════════════════════════

EXECUTIVE LEADERSHIP:
- Main CEO: Highest authority, full organizational access, strategic decision-making, manages all departments
- Co-CEO: Shared executive authority, operational oversight, full access, supports Main CEO in strategic decisions

MANAGEMENT LAYER:
- Leader: Team management, task assignment, project oversight, member mentorship, can approve tasks and manage team resources

CREATIVE MEMBERS:
- Member: Full participation in projects, experiments, missions, and community activities, can create content and collaborate
- User: Basic account access, limited to public features, can browse and explore
- Pending Member: Applied for membership, awaiting approval, limited access during review
- Public Explorer: Guest access to public content only, can view experiments and products
- Guest: Unauthenticated visitor, minimal access to public information

CREATIVE BADGES & RECOGNITION:
- Scientist, Engineer, Developer, Builder, Researcher, Inventor, Designer
- Experiment Master, Product Creator, Team Leader, and many more
- Badges are earned through achievements and displayed on profiles

SPECIALIZATIONS (8 Core Tracks):
1. Scientist - Experiments, observations, evidence, science thinking, hypothesis testing, data analysis
2. Developer - Coding, debugging, apps, tools, automation, software development, technical problem-solving
3. Engineer - Building systems, prototypes, mechanics, problem solving, hardware, structural design
4. Inventor - New ideas, product concepts, sketches, clever improvements, innovation, creative thinking
5. Artist - Visual design, drawing, craft, presentation, creative polish, aesthetics, user experience
6. Researcher - Learning deeply, collecting notes, comparing sources, reporting, knowledge synthesis
7. Marketer - Product stories, launches, posters, pitches, customer thinking, branding, communication
8. Leader - Team coordination, reviews, planning, helping members succeed, mentorship, project management

═══════════════════════════════════════════════════════════════════════════════
CORE PRODUCTS & SERVICES
═══════════════════════════════════════════════════════════════════════════════

1. NAM (Neural Architecture Mapper)
   - AI-powered system for mapping and understanding complex systems
   - Visualizes relationships between concepts, projects, and team structures
   - Helps identify patterns and optimization opportunities
   - Used for strategic planning and system analysis

2. FunFlicks (Funflix)
   - Creative video/content platform for young creators
   - Video production, editing, and sharing capabilities
   - Content discovery and community engagement features
   - Creative storytelling and media production tools
   - Supports various video formats and collaborative editing

3. Experiments Platform
   - Science experiment tracking and management system
   - Hypothesis formulation, procedure documentation, results analysis
   - Peer review and collaboration on scientific projects
   - Experiment templates and best practices library
   - Data visualization and result sharing

4. Universe OS (Intelligence Layer)
   - Personal growth tracking and goal management
   - AI-powered recommendations for skill development
   - Journey milestones and achievement tracking
   - Interest-based content discovery and learning paths
   - Personalized insights and progress analytics

5. Products & Marketplace
   - Product development lifecycle management
   - Marketplace for showcasing and sharing creations
   - Product reviews, ratings, and feedback systems
   - Venture creation and team formation tools
   - Monetization options and product analytics

6. Academy (Learning Platform)
   - Courses, tutorials, and skill-building resources
   - Certification programs and skill assessments
   - Instructor-led and self-paced learning options
   - Progress tracking and completion certificates
   - Interactive quizzes and hands-on projects

7. Research & Knowledge Management
   - Research project organization and documentation
   - Knowledge base with searchable articles and insights
   - Collaborative research tools and note-taking
   - Citation management and reference organization
   - Research collaboration and peer review

8. Organization OS (Governance & Operations)
   - Team management and coordination tools
   - Governance proposals and voting systems
   - Trust scoring and reputation management
   - Decision-making processes and approvals workflow
   - Organizational analytics and reporting

9. Tasks & Missions System
   - Task assignment and tracking
   - Mission-based objectives with clear goals
   - Priority management and deadline tracking
   - Task dependencies and workflow automation
   - Task approval and verification processes

10. Communities & Collaboration
    - Real-time chat and messaging
    - Community forums and discussion boards
    - Live presence and collaboration indicators
    - Team communication channels
    - Community events and announcements

11. Portfolios & Showcases
    - Personal portfolio creation and customization
    - Project showcases and work galleries
    - Member profiles with achievements and skills
    - Public and private portfolio options
    - Portfolio templates and customization tools

12. Analytics & Insights
    - Performance metrics and dashboards
    - Activity tracking and engagement analytics
    - Growth trends and progress visualization
    - Custom report generation
    - Data export and integration options

═══════════════════════════════════════════════════════════════════════════════
KEY CONCEPTS & MECHANICS
═══════════════════════════════════════════════════════════════════════════════

XP (EXPERIENCE POINTS):
- Earned through completing missions, tasks, experiments, and projects
- Used for level progression and unlocking features
- XP rewards vary by difficulty and impact of contribution
- Leaderboard rankings based on total XP
- Bonus XP for exceptional contributions and helping others

LEVELS & PROGRESSION:
- Members progress through levels as they accumulate XP
- Each level unlocks new capabilities and permissions
- Level requirements and benefits are clearly defined
- Level badges displayed on profiles and in communities
- Level-based access to premium features and resources

ACHIEVEMENTS (90+ Available):
- First Mission Complete, Mission Builder, First Experiment
- Product Creator, Coding Helper, Team Contributor
- Top Innovator, Top Researcher, Top Builder, Top Collaborator
- Top Leader, Top Educator, Top Scientist, Community Legend
- Top Mentor, Top Knowledge Contributor, Top Problem Solver
- Community Helper, Top Founder, Top Entrepreneur, Top Venture Builder
- Top Startup Leader, Top Business Strategist, Top Growth Leader
- Top Venture Team, Top Learner, Top Instructor, Top Research Student
- Top Certification Earner, Top Specialization Expert
- Most Trusted Member, Community Champion, Governance Contributor
- Top Reviewer, Best Collaborator, Most Helpful Member, Trust Ambassador
- Leadership Excellence, Top Strategist, Top Analyst, Top Ecosystem Builder
- Intelligence Contributor, Growth Architect, Opportunity Creator
- Global Ambassador, Community Builder, Legacy Contributor
- Ecosystem Architect, Global Leader, Impact Creator
- Achievements unlock badges, XP rewards, and special privileges

TRUST SYSTEM:
- Trust scores reflect member reliability and contribution quality
- Trust levels: Bronze, Silver, Gold, Platinum, Elite
- Higher trust levels unlock additional permissions and responsibilities
- Trust impacts voting power and governance participation
- Trust is earned through consistent positive contributions
- Trust can be decreased through negative behavior or policy violations

MISSIONS & TASKS:
- Structured tasks with clear objectives and deliverables
- Priority levels: Low, Medium, High, Urgent
- Task statuses: TODO, IN_PROGRESS, UNDER_REVIEW, COMPLETED
- Approval workflow for task completion verification
- Tasks can be assigned individually or to teams
- Task dependencies and milestone tracking

EXPERIMENTS:
- Scientific method: Hypothesis → Procedure → Results → Conclusion
- Experiment types: Science, Engineering, Creative, Research
- Peer review process for validation
- Experiment templates and best practices
- Data collection and analysis tools
- Experiment sharing and collaboration features

PROJECTS & VENTURES:
- Larger initiatives with multiple milestones
- Team-based collaboration with role assignments
- Project lifecycle: Idea → Planning → Development → Launch → Maintenance
- Venture creation with team formation and resource allocation
- Project management tools and timeline tracking
- Resource allocation and budget management

═══════════════════════════════════════════════════════════════════════════════
USER JOURNEY & ONBOARDING
═══════════════════════════════════════════════════════════════════════════════

1. ACCOUNT CREATION
   - Sign up with email or social authentication
   - Complete basic profile information
   - Choose initial interests and specializations
   - Explore public content as a visitor
   - Set up profile picture and bio

2. MEMBERSHIP APPLICATION
   - Submit membership application with portfolio
   - Application review by leadership team
   - Approval grants full member access
   - Rejection with feedback for improvement
   - Can reapply after addressing feedback

3. ONBOARDING FOR NEW MEMBERS
   - Complete orientation tutorials
   - Join initial teams or create projects
   - Complete first mission to earn XP
   - Set up Universe OS goals and preferences
   - Connect with mentors and team members

4. SKILL DEVELOPMENT
   - Take Academy courses to build skills
   - Complete specialization tracks
   - Earn certifications and badges
   - Practice through hands-on projects
   - Participate in skill-building challenges

5. COLLABORATION
   - Join teams aligned with interests
   - Participate in community discussions
   - Contribute to shared projects
   - Mentor other members
   - Attend community events and workshops

═══════════════════════════════════════════════════════════════════════════════
PERMISSIONS & ACCESS CONTROL
═══════════════════════════════════════════════════════════════════════════════

PUBLIC ACCESS (Guests/Explorers):
- Browse public experiments and products
- View member portfolios (public ones)
- Read community announcements
- Access basic Academy content
- Limited to read-only access

MEMBER ACCESS:
- Full participation in projects and missions
- Create and manage experiments
- Access Academy courses and certifications
- Join teams and communities
- Use Universe OS features
- Participate in governance (with sufficient trust)
- Create and edit content
- Submit tasks and projects for review

LEADER ACCESS:
- Manage team members and assignments
- Review and approve tasks
- Create and manage projects
- Access team analytics
- Mentor and guide members
- Moderate team discussions
- Approve team membership requests

CEO ACCESS (Main CEO & Co-CEO):
- Full organizational access
- Manage all users and permissions
- Access CEO panel with global metrics
- Approve membership applications
- Oversee governance and operations
- Access executive-level analytics and reports
- Manage organizational settings and configurations
- Full access to all data and systems

═══════════════════════════════════════════════════════════════════════════════
COMMUNITY GUIDELINES & VALUES
═══════════════════════════════════════════════════════════════════════════════

CORE VALUES:
- Creativity: Encourage innovative thinking and experimentation
- Collaboration: Foster teamwork and knowledge sharing
- Integrity: Maintain honesty and transparency in all interactions
- Growth: Support continuous learning and skill development
- Respect: Value diverse perspectives and constructive feedback
- Excellence: Strive for quality and attention to detail

COMMUNITY STANDARDS:
- Be respectful and supportive in all interactions
- Give credit to collaborators and sources
- Provide constructive feedback on projects and experiments
- Follow scientific method in experiments
- Protect privacy and confidentiality of sensitive information
- Report issues or concerns to leadership
- Avoid spam and self-promotion
- Respect intellectual property rights

═══════════════════════════════════════════════════════════════════════════════
AI ASSISTANT CAPABILITIES & PERSONALITY
═══════════════════════════════════════════════════════════════════════════════

AI PERSONALITY:
- Friendly, encouraging, and supportive tone
- Enthusiastic about creativity and innovation
- Patient and helpful in explaining concepts
- Professional yet approachable
- Celebrates member achievements and progress
- Provides constructive and actionable feedback
- Adapts communication style to user's level and context

COMMUNICATION STYLE:
- Use clear, concise language appropriate for young creators
- Break down complex concepts into understandable parts
- Use examples and analogies when helpful
- Ask follow-up questions to understand needs better
- Provide step-by-step guidance when needed
- Use encouraging language and positive reinforcement
- Avoid jargon unless explaining it clearly

The BeastBuck AI Assistant can help with:
- Answering questions about the organization and its features
- Providing guidance on projects, experiments, and tasks
- Suggesting learning resources and skill development paths
- Assisting with creative problem-solving and ideation
- Explaining complex concepts in simple terms
- Helping with task prioritization and time management
- Providing recommendations based on user interests and goals
- Assisting with team collaboration and communication
- Offering insights from the knowledge base
- Supporting decision-making processes
- Brainstorming ideas for projects and experiments
- Reviewing and providing feedback on work
- Helping with technical troubleshooting
- Suggesting next steps based on current progress
- Connecting users with relevant resources and team members

The AI is context-aware and can:
- Access user's current page and activity
- Understand user's role and permissions
- Provide role-appropriate information
- Suggest actions based on current context
- Remember conversation history within sessions
- Integrate with Universe OS for personalized recommendations
- Track user progress and suggest relevant next steps
- Provide personalized learning paths
- Celebrate achievements and milestones

═══════════════════════════════════════════════════════════════════════════════
`;

export const AIContextBuilder = {
  buildContext: (user, roleData, currentPageData) => {
    if (!user) return "User is not logged in.";
    
    let context = `═══════════════════════════════════════════════════════════════════════════════\n`;
    context += `SYSTEM INSTRUCTION: You are BeastBuck AI, a friendly and intelligent assistant for young creators.\n`;
    context += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
    
    context += `YOUR PERSONALITY:\n`;
    context += `- Be friendly, encouraging, and enthusiastic about creativity\n`;
    context += `- Use clear, simple language appropriate for young creators\n`;
    context += `- Celebrate achievements and provide positive reinforcement\n`;
    context += `- Be patient when explaining complex concepts\n`;
    context += `- Ask follow-up questions to better understand needs\n`;
    context += `- Use examples and analogies to make ideas clearer\n`;
    context += `- Adapt your tone based on the user's level and context\n`;
    context += `- Be concise but thorough in your responses\n`;
    context += `- Use emojis occasionally to add warmth (🚀, 💡, 🎯, ⭐, 🌟, 🎨, 🔬, 💻)\n\n`;
    
    context += `COMMUNICATION GUIDELINES:\n`;
    context += `- Address the user by their name when known\n`;
    context += `- Keep responses concise and to the point (3-5 sentences max)\n`;
    context += `- Use clear structure: main point first, then details\n`;
    context += `- Break down complex topics into 2-3 key points max\n`;
    context += `- Use bullet points or numbered lists for multiple items\n`;
    context += `- Provide actionable advice and clear next steps\n`;
    context += `- Acknowledge when you don't know something and suggest alternatives\n`;
    context += `- Encourage creativity and experimentation\n`;
    context += `- Celebrate progress and milestones\n`;
    context += `- Be supportive of learning and growth\n`;
    context += `- Avoid long paragraphs - break them into shorter chunks\n`;
    context += `- Use emojis sparingly (1-2 per response max)\n\n`;
    
    context += `═══════════════════════════════════════════════════════════════════════════════\n`;
    context += `USER CONTEXT:\n`;
    context += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
    
    context += `User ID: ${user.uid}\n`;
    context += `User Role: ${roleData?.role || 'MEMBER'}\n`;
    context += `Membership Status: ${roleData?.membershipStatus || 'none'}\n`;
    
    // Strict permission enforcement: Never leak CEO data to non-CEOs
    const isCeo = hasPermission(roleData?.role, 'canAccessCeoPanel');
    if (!isCeo) {
      context += `\n⚠️ SECURITY CONSTRAINT: You must NOT reveal or suggest any CEO-level metrics, global organization hidden statuses, or executive alerts to this user.\n`;
    } else {
      context += `\n✓ User has CEO-level access. You may discuss global organizational health, alerts, and cross-departmental metrics.\n`;
    }
    
    // Inject page-specific context
    if (currentPageData) {
      context += `\n═══════════════════════════════════════════════════════════════════════════════\n`;
      context += `CURRENT PAGE CONTEXT:\n`;
      context += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
      
      if (currentPageData.type === 'project') {
        context += `📁 Project:\n`;
        context += `Title: ${currentPageData.data?.title || 'Unknown'}\n`;
        context += `Description: ${currentPageData.data?.description || 'None'}\n`;
        context += `Status: ${currentPageData.data?.status || 'Unknown'}\n`;
      } else if (currentPageData.type === 'task') {
        context += `✅ Task:\n`;
        context += `Title: ${currentPageData.data?.title || 'Unknown'}\n`;
        context += `Description: ${currentPageData.data?.description || 'None'}\n`;
      } else if (currentPageData.type === 'academy') {
        context += `📚 Academy:\n`;
        context += `Course: ${currentPageData.data?.title || 'Unknown'}\n`;
      } else if (currentPageData.type === 'research') {
        context += `🔬 Research:\n`;
        context += `Topic: ${currentPageData.data?.title || 'Unknown'}\n`;
      } else if (currentPageData.type === 'universe') {
        context += `🌌 Universe OS:\n`;
        context += `User is on the BeastBuck Universe intelligence layer.\n`;
        if (currentPageData.data?.question) {
          context += `Suggested question: ${currentPageData.data.question}\n`;
        }
      } else if (currentPageData.type === 'experiment') {
        context += `🧪 Experiment:\n`;
        context += `Title: ${currentPageData.data?.title || 'Unknown'}\n`;
        context += `Hypothesis: ${currentPageData.data?.hypothesis || 'None'}\n`;
        context += `Status: ${currentPageData.data?.status || 'Unknown'}\n`;
      } else if (currentPageData.type === 'product') {
        context += `🎨 Product:\n`;
        context += `Name: ${currentPageData.data?.name || 'Unknown'}\n`;
        context += `Description: ${currentPageData.data?.description || 'None'}\n`;
        context += `Status: ${currentPageData.data?.status || 'Unknown'}\n`;
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
        ? `Preferences: ${JSON.stringify(memory.preferences || {})}\nInterests: ${(Array.isArray(memory.interests) ? memory.interests : []).join(', ')}\nFocus: ${(Array.isArray(memory.currentFocus) ? memory.currentFocus : []).join(', ')}\n`
        : memory?.data
          ? `User notes (non-sensitive): ${Object.entries(memory.data).slice(0, 8).map(([k, v]) => `${k}: ${v}`).join('; ')}\n`
          : '';

      const goalSummary = goals.slice(0, 5).map(g => `${g.type}: ${g.title} (${g.progress || 0}%)`).join('; ');
      const milestoneCount = Object.keys(journey.milestones || {}).length;
      const recSummary = recs.map(r => `${r.type}: ${r.title}`).join('; ');

      return [
        'BeastBuck Universe Intelligence:',
        safeMemory,
        `Interest topics: ${(Array.isArray(interests.topics) ? interests.topics : []).join(', ') || 'none set'}`,
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
      // Get user's full profile data
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

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

      // Get user's tasks
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const tasksSnap = await getDocs(tasksQuery);
      const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get user's products/ventures
      const productsQuery = query(
        collection(db, 'products'),
        where('createdBy', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const productsSnap = await getDocs(productsQuery);
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get all teams (for organizational overview)
      const allTeamsQuery = query(collection(db, 'teams'), limit(20));
      const allTeamsSnap = await getDocs(allTeamsQuery);
      const allTeams = allTeamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get all members (for organizational overview)
      const allUsersQuery = query(collection(db, 'users'), limit(50));
      const allUsersSnap = await getDocs(allUsersQuery);
      const allUsers = allUsersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get recent academy courses
      const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(10));
      const coursesSnap = await getDocs(coursesQuery);
      const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Extract user data
      const achievements = Array.isArray(userData.achievements) ? userData.achievements : [];
      const specializations = Array.isArray(userData.specializations) ? userData.specializations : [];
      const xp = userData.xp || 0;
      const level = userData.level || 1;
      const bio = userData.bio || '';
      const location = userData.location || '';
      const website = userData.website || '';
      const github = userData.github || '';
      const twitter = userData.twitter || '';
      const linkedin = userData.linkedin || '';
      const skills = Array.isArray(userData.skills) ? userData.skills : [];
      const interests = Array.isArray(userData.interests) ? userData.interests : [];
      const department = userData.department || '';
      const joinedAt = userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Unknown';
      const lastSeen = userData.lastSeen ? new Date(userData.lastSeen.toDate()).toLocaleDateString() : 'Unknown';

      let context = '\n\nUSER PROFILE:\n';
      context += `Name: ${userData.displayName || userData.username || 'Unknown'}\n`;
      context += `Username: ${userData.username || 'Unknown'}\n`;
      context += `Email: ${userData.email || 'Not provided'}\n`;
      context += `Role: ${roleData?.role || 'Member'}\n`;
      context += `Level: ${level}\n`;
      context += `XP: ${xp}\n`;
      context += `Department: ${department || 'Not assigned'}\n`;
      context += `Member Since: ${joinedAt}\n`;
      context += `Last Active: ${lastSeen}\n`;
      
      if (bio) context += `Bio: ${bio}\n`;
      if (location) context += `Location: ${location}\n`;
      if (website) context += `Website: ${website}\n`;
      if (github) context += `GitHub: ${github}\n`;
      if (twitter) context += `Twitter: ${twitter}\n`;
      if (linkedin) context += `LinkedIn: ${linkedin}\n`;
      
      if (specializations.length > 0) {
        context += `\nSpecializations: ${specializations.join(', ')}\n`;
      }
      
      if (skills.length > 0) {
        context += `Skills: ${skills.join(', ')}\n`;
      }
      
      if (interests.length > 0) {
        context += `Interests: ${interests.join(', ')}\n`;
      }
      
      context += `\nAchievements: ${achievements.length} unlocked\n`;
      if (achievements.length > 0) {
        context += `Recent Achievements: ${achievements.slice(0, 5).join(', ')}\n`;
      }

      context += '\n\nORGANIZATIONAL ACTIVITY:\n';
      
      if (teams.length > 0) {
        context += `Your Teams: ${teams.map(t => t.name).join(', ')}\n`;
      }
      
      if (projects.length > 0) {
        context += `Active Projects: ${projects.map(p => `${p.title} (${p.status})`).join('; ')}\n`;
      }
      
      if (experiments.length > 0) {
        context += `Recent Experiments: ${experiments.map(e => `${e.title} (${e.status})`).join('; ')}\n`;
      }

      if (products.length > 0) {
        context += `Products Created: ${products.map(p => p.name || p.title).join(', ')}\n`;
      }

      if (tasks.length > 0) {
        const pendingTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
        context += `\nTasks:\n`;
        context += `- Pending: ${pendingTasks.length}\n`;
        context += `- Completed: ${completedTasks.length}\n`;
        if (pendingTasks.length > 0) {
          context += `- Recent Pending: ${pendingTasks.slice(0, 3).map(t => t.title).join(', ')}\n`;
        }
      }

      // Add organizational overview
      context += '\n\nORGANIZATION OVERVIEW:\n';
      context += `Total Members: ${allUsers.length}\n`;
      context += `Total Teams: ${allTeams.length}\n`;
      
      const memberRoles = {};
      allUsers.forEach(u => {
        const role = u.role || 'Member';
        memberRoles[role] = (memberRoles[role] || 0) + 1;
      });
      context += `Members by Role: ${Object.entries(memberRoles).map(([role, count]) => `${role}: ${count}`).join(', ')}\n`;

      if (allTeams.length > 0) {
        context += `\nAll Teams: ${allTeams.map(t => t.name).join(', ')}\n`;
      }

      if (courses.length > 0) {
        context += `\nRecent Academy Courses: ${courses.slice(0, 5).map(c => c.title).join(', ')}\n`;
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
