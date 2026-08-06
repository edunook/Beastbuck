# BeastBuck Codebase - Comprehensive Detailed Analysis Report

**Generated:** June 30, 2026  
**Analysis Scope:** Full codebase architecture, services, components, routing, security, and data models

---

## Executive Summary

BeastBuck is a comprehensive gamified educational and organizational platform built with React, Firebase, and modern web technologies. The platform integrates multiple complex systems including research management, marketplace functionality, organizational governance, AI studio, video streaming (FunFlix), venture management, and a robust gamification engine with XP, levels, achievements, and certificates.

**Key Architectural Highlights:**
- **Frontend:** React with Vite, React Router for navigation, TailwindCSS for styling
- **Backend:** Firebase (Firestore, Realtime Database, Storage, Authentication)
- **State Management:** Zustand stores (useGlobalStore, usePresenceStore, useAuth)
- **Security:** Role-based access control (RBAC) with Firestore security rules
- **Real-time Features:** Firebase Realtime Database for presence, Firestore for data
- **File Upload:** Firebase Storage with comprehensive validation

---

## Table of Contents

1. [Firebase Services Analysis](#firebase-services-analysis)
2. [UI Components & Layouts](#ui-components--layouts)
3. [Routing Structure & Navigation](#routing-structure--navigation)
4. [Firestore Security Rules](#firestore-security-rules)
5. [Storage Security Rules](#storage-security-rules)
6. [State Management](#state-management)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Models & Collections](#data-models--collections)
9. [Key Patterns & Utilities](#key-patterns--utilities)
10. [Recommendations & Observations](#recommendations--observations)

---

## Firebase Services Analysis

### 1. Core Services

#### `config.js`
- Initializes Firebase app with Firestore, Realtime Database, and Storage
- Central configuration point for all Firebase services

#### `auth.js`
- Handles Firebase Authentication
- User registration, login, logout
- Profile management
- Role assignment and verification

#### `users.js`
- User profile CRUD operations
- User statistics tracking
- XP and level management integration
- Specializations and achievements

---

### 2. Gamification System (`gamification.js`)

**Purpose:** Central gamification engine managing XP, achievements, badges, and leaderboards

**Key Functions:**
- `awardXP()`: Awards XP to users with transactional updates
- `grantAchievement()`: Grants achievements to users
- `assignBadge()`: Assigns badges to user profiles
- `getLeaderboard()`: Retrieves leaderboards by type (global, skills, etc.)
- `getRecentActivity()`: Fetches recent gamification activities

**Constants:**
- `XP_REWARD_TYPES`: Defined types for different XP reward sources
- `calculateLevel()`: Determines user level based on XP

**Data Models:**
- XP logs with source tracking
- Achievement definitions
- Badge assignments
- Leaderboard snapshots

---

### 3. Research Service (`research.js`)

**Purpose:** Manage research papers, challenges, certificates, and collaboration

**Key Functions:**
- `createResearch()`: Create new research papers
- `updateResearch()`: Update research content
- `publishResearch()`: Publish research to public
- `incrementViews()`, `toggleLike()`, `toggleBookmark()`: Engagement tracking
- `calculateResearchXP()`: Calculate XP for research contributions
- `awardResearchCertificate()`: Issue certificates for research
- `manageChallenges()`: Research challenge management
- `getResearchAnalytics()`: Analytics for research performance
- `funResearchMode()`: Simplified research mode for teens

**Data Models:**
- Research papers with metadata, status, collaborators
- Research challenges with submissions
- Research certificates with verification codes
- Research analytics and metrics

---

### 4. Portfolio Service (`portfolio.js`)

**Purpose:** Aggregate and display user portfolios with comprehensive statistics

**Key Functions:**
- `regeneratePortfolio()`: Regenerate user portfolio data
- `getUserPortfolio()`: Retrieve user portfolio
- `StatsAggregator`: Aggregates stats from multiple collections
- `calculateImpactScore()`: Calculate user impact score
- `preGeneratePortfolios()`: Batch portfolio generation

**Data Models:**
- User portfolios with projects, experiments, products
- Impact scores and statistics
- Privacy settings
- Auto-populated sections from user activity

---

### 5. Marketplace Service (`marketplace.js`)

**Purpose:** Manage marketplace resources, collections, transactions, and creator profiles

**Key Functions:**
- `createResource()`: Create marketplace items
- `updateResource()`: Update resource details
- `searchResources()`: Search with filters
- `trackDownload()`, `trackView()`: Engagement tracking
- `bookmarkResource()`, `reviewResource()`: User interactions
- `manageCreatorProfile()`: Creator profile management
- `processTransaction()`: Handle marketplace transactions
- `getMarketplaceHealth()`: Marketplace analytics

**Data Models:**
- Marketplace resources (resources, services, bundles)
- Collections and categories
- Creator profiles
- Transactions and reviews
- Bookmarks and wishlists

---

### 6. FunFlix Service (`funflix.js`)

**Purpose:** Video content management with streaming and engagement

**Key Functions:**
- `createVideo()`: Upload and create video content
- `getVideo()`, `getVideos()`: Retrieve videos
- `incrementViews()`: Track video views
- `toggleLike()`: Like/unlike videos
- XP integration with GamificationService

**Data Models:**
- Video content with metadata
- View and like tracking
- Creator information

---

### 7. Governance Service (`governance.js`)

**Purpose:** Organizational governance including health, departments, elections, policies

**Key Functions:**
- `trackOrganizationHealth()`: Monitor organization metrics
- `manageDepartments()`, `manageTeams()`: Organizational structure
- `calculateReputation()`, `calculateTrust()`: User reputation system
- `handleProposals()`, `handleVoting()`: Proposal and voting system
- `manageElections()`: Leadership elections
- `verificationCenter()`: User verification
- `conflictResolution()`: Dispute management
- `policyManagement()`: Policy creation and updates
- `meetingScheduling()`: Meeting management
- `auditLogging()`: Audit trail
- `automationControl()`: Governance automations

**Data Models:**
- Organization health metrics
- Department and team structures
- Reputation and trust scores
- Proposals and votes
- Elections and candidates
- Verification records
- Conflict cases
- Policies and meeting records
- Audit logs

---

### 8. Organization Service (`organization.js`)

**Purpose:** Manage organizational hierarchy (divisions, departments, labs, projects)

**Key Functions:**
- `createDivision()`, `createDepartment()`, `createLab()`, `createProject()`: Hierarchy management
- `update*()`: Update organizational units
- `archive*()`: Archive units
- `getOrganizationalStructure()`: Retrieve full structure
- `logOrgChange()`: Log organizational changes to audit
- `getMemberAffiliations()`: Get user's organizational affiliations

**Data Models:**
- Divisions, departments, labs, projects
- Organizational announcements
- Member affiliations

---

### 9. Tasks Service (`tasks.js`)

**Purpose:** Task management with review workflow and XP rewards

**Key Functions:**
- `getUserTasks()`: Fetch user tasks
- `getTasksUnderReview()`: Get pending reviews
- `createTask()`: Create new tasks
- `updateProgress()`: Update task progress
- `submitProof()`: Submit completion proof
- `reviewSubmission()`: Approve/reject with XP award
- `archiveTask()`: Archive completed tasks

**Data Models:**
- Tasks with status, progress, submissions
- Proof submissions
- Review records

---

### 10. Experiments Service (`experiments.js`)

**Purpose:** Scientific experiment management

**Key Functions:**
- `createExperiment()`, `updateExperiment()`, `deleteExperiment()`: CRUD operations
- `archiveExperiment()`, `featureExperiment()`: Status management
- `getExperiment()`, `getExperiments()`: Retrieval
- `incrementViews()`, `toggleLike()`: Engagement
- `subscribeToExperiment()`: Real-time updates
- `searchExperiments()`: Search functionality
- `addComment()`, `getComments()`: Comments
- `getExperimentCreators()`: Creator information

**Data Models:**
- Experiments with materials, procedure, results
- Comments and engagement
- Featured status

---

### 11. Knowledge Service (`knowledge.js`)

**Purpose:** Knowledge base with articles, collections, and Q&A

**Key Functions:**
- `indexEntityForSearch()`: Index for search
- `getArticle()`, `publishArticle()`: Article management
- `createCollection()`: Smart collections
- `submitRequest()`: Knowledge requests (Q&A)
- `getTrendingArticles()`, `getRecommendedArticles()`: Discovery
- XP integration for publishing

**Data Models:**
- Knowledge articles
- Smart collections
- Knowledge requests
- Search indexes

---

### 12. Certificates Service (`certificates.js`)

**Purpose:** Digital certificate issuance and verification

**Key Functions:**
- `issueCertificate()`: Issue new certificates
- `verifyCertificate()`: Verify certificate validity
- `revokeCertificate()`: Revoke certificates
- `preventDuplicateCertificates()`: Prevent duplicates
- `generateVerificationCode()`, `generateCertNumber()`: Unique code generation
- `getUserCertificates()`, `getAvailablePrograms()`: Retrieval

**Data Models:**
- Certificates with verification codes
- Certificate programs
- Revocation records

---

### 13. Skills Service (`skills.js`)

**Purpose:** Skill development with posts, resources, and skill-specific XP

**Key Functions:**
- `seedDefaultSkills()`: Initialize default skills
- `createSkill()`, `getSkills()`, `getSkill()`: Skill management
- `getSkillNetwork()`: Get skill with related content
- `createPost()`, `createResource()`: Content creation
- `awardSkillXP()`: Skill-specific XP with transactional updates
- `awardBadge()`: Badge assignment

**Data Models:**
- Skills with categories and badges
- Skill posts (discussions, questions, guides, challenges)
- Resources (books, PDFs, videos, websites)
- Skill XP logs
- Skill statistics

**Default Skills:**
- Physics, Chemistry, Biology (Science)
- Programming, AI (Technology)
- Engineering, Robotics (Build)
- Leadership, Marketing (Company)
- Design, Arts (Creative)

---

### 14. Products Service (`products.js`)

**Purpose:** Product marketplace with categories, pricing, and reviews

**Key Functions:**
- `createProduct()`, `updateProduct()`, `deleteProduct()`: CRUD
- `archiveProduct()`, `featureProduct()`: Status management
- `subscribeToProduct()`: Real-time updates
- `incrementViews()`, `toggleLike()`: Engagement
- `searchProducts()`: Search with filters and sorting
- `addComment()`, `deleteComment()`: Comments
- `getCreators()`: Creator listing

**Data Models:**
- Products with categories, pricing, media
- Comments and reviews
- Creator information

**Product Categories:**
- Handmade, Digital, Science Kit, Model, Poster, Tool, Game, Invention

**Product Statuses:**
- DRAFT, SHOWCASE, AVAILABLE, SOLD_OUT, ARCHIVED

---

### 15. Ventures Service (`ventures.js`)

**Purpose:** Startup/venture management with lifecycle stages

**Key Functions:**
- `createVenture()`: Create new venture
- `getVenture()`, `getVenturesByVisibility()`, `getVenturesByLifecycle()`: Retrieval
- `updateVisibility()`, `updateLifecycleStage()`: Status updates
- `linkEntityToVenture()`: Link research, inventions, products to ventures

**Data Models:**
- Ventures with visibility and lifecycle stages
- Venture members with roles
- Venture links to other entities
- Funding simulation data
- Health scores

**Visibility Levels:**
- PRIVATE, TEAM_ONLY, ORGANIZATION_VISIBLE, PUBLIC_SHOWCASE

**Lifecycle Stages:**
- IDEA, RESEARCH, VALIDATION, PROTOTYPE, MVP, TESTING, EARLY_USERS, GROWTH, SCALING, ENTERPRISE, GLOBAL, LEGACY

---

### 16. Workspace Service (`workspace.js`)

**Purpose:** Digital workspace with documents, notes, notebooks, whiteboards

**Key Functions:**
- `getUserWorkspaces()`, `getWorkspace()`, `createWorkspace()`: Workspace management
- `getDocuments()`, `saveDocument()`, `saveDocumentVersion()`: Document management
- `getNotes()`, `saveNote()`, `deleteNote()`: Notes
- `getNotebooks()`, `createNotebook()`, `saveNotebookEntry()`: Research notebooks
- `getWhiteboards()`, `saveWhiteboard()`: Whiteboards
- `getMindMaps()`, `saveMindMap()`: Mind maps
- `getMembers()`, `addMember()`, `removeMember()`: Member management
- `logActivity()`, `getActivity()`: Activity logging

**Data Models:**
- Workspaces with members
- Documents with versions
- Notes
- Research notebooks with entries
- Whiteboards
- Mind maps
- Workspace activity logs

---

### 17. Teams Service (`teams.js`)

**Purpose:** Team management with flexible organization relations

**Key Functions:**
- `createTeam()`: Create team with department/lab/project relations
- `getTeam()`: Retrieve team
- `addMember()`: Add members to team
- `updateTeam()`: Update team information

**Data Models:**
- Teams with name, description, leader, members
- Relations to departments, labs, projects

---

### 18. Storage Service (`storage.js`)

**Purpose:** File upload with comprehensive validation and security

**Key Functions:**
- `uploadFile()`: Generic file upload with validation
- `uploadExperimentMedia()`, `uploadChallengeMedia()`, `uploadProductMedia()`: Specialized uploads
- `uploadCreativeMedia()`, `uploadFunFlixMedia()`, `uploadProofFile()`: Context-specific uploads
- `deleteFile()`: File deletion
- `validateFile()`: Comprehensive validation

**Security Features:**
- File size limits (10MB images, 2GB videos, 10MB documents)
- MIME type validation
- Blocked dangerous MIME types (JavaScript, HTML, PHP, XML)
- Filename validation
- Extension validation
- Resource type detection

**Allowed Types:**
- Images: JPEG, PNG, GIF, WebP, SVG
- Videos: MP4, WebM, OGG
- Documents: PDF, DOC, DOCX

---

### 19. Presence Service (`services/realtime/presence.js`)

**Purpose:** Real-time user presence and activity tracking

**Key Functions:**
- `initializePresence()`: Initialize presence on login
- `setPresenceState()`: Set user presence state
- `updateContext()`: Update activity context (throttled)
- `subscribeToPresence()`: Subscribe to presence updates
- `subscribeToUserPresence()`: Subscribe to specific user
- `cleanup()`: Cleanup presence on logout

**Data Models:**
- Presence states (online, busy, away, offline, collaborating)
- Activity contexts
- Last seen timestamps
- Device information

**Constants:**
- `PRESENCE_STATES`: Available presence states
- `PRESENCE_COLORS`: Color mappings for states
- `PRESENCE_LABELS`: Display labels

---

## UI Components & Layouts

### 1. Layout Components

#### `AppShell.jsx`
- Main application layout wrapper
- Integrates Sidebar, Topbar, and content area
- Mobile responsive with drawer

#### `Sidebar.jsx`
- Main navigation sidebar with collapsible design
- Role-based navigation filtering
- Member-only sections hidden for non-members
- Admin section for CEO/Admin roles
- Navigation items:
  - Home, Portfolio
  - Research (Knowledge Maps)
  - Community (Chat, Discover)
  - Workspace (Skills, Creative Hub, Experiments, Products)
  - Ventures (Startup Lab, Venture Directory)
  - FunFlix (Creator Studio, Challenges)
  - AI Studio (My AIs, AI Marketplace)
  - Organization (Collaboration)
  - Governance (Elections, Verification)
  - Achievements (Portfolios, Leaderboards)
  - Profile, Settings

#### `Topbar.jsx`
- Top navigation bar with search
- Mobile menu toggle
- Presence panel toggle
- Notification bell
- User profile link with avatar
- Online member count display

#### `MobileBottomNav.jsx`
- Mobile bottom navigation
- Quick access to main features

#### `MobileDrawer.jsx`
- Mobile slide-out drawer for navigation

#### `NotificationBell.jsx`
- Notification indicator with badge
- Opens notification center

---

### 2. UI Components

#### `Button.jsx`
- Reusable button component with variants:
  - primary, secondary, danger, ghost, success
- Sizes: sm, md, lg
- Features:
  - Loading state with spinner
  - Success state
  - Error handling with display
  - Ripple effect option
  - Press animation
  - Minimum 44px touch target for accessibility

#### `Modal.jsx`
- Accessible modal component
- Features:
  - Focus trapping
  - Escape key handling
  - Backdrop click to close
  - Body scroll lock
  - Focus restoration on close
  - Size variants: sm, md, lg, xl, full
- Sub-components: ModalHeader, ModalBody, ModalFooter

#### `Card.jsx`
- Card component with depth levels (1-4)
- Features:
  - Hoverable option with animations
  - Premium border option
  - Glass morphism option
- Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

#### `Input.jsx`
- Form input component
- Features:
  - Label and helper text
  - Error and success states
  - Loading state
  - Icon support
  - Focus states with glow effect
  - Validation indicators

#### `EmptyState.jsx`
- Empty state display component
- Used for no-data scenarios

#### `Skeleton.jsx`
- Loading skeleton component
- For content loading states

#### `DashboardCard.jsx`
- Specialized card for dashboard widgets

#### `InteractiveCard.jsx`
- Card with enhanced interactivity

#### `FormElements.jsx`
- Collection of form-related components

#### `UIElements.jsx`
- General UI element collection

---

### 3. Specialized Components

#### `NotificationCenter.jsx`
- Notification management component
- Features:
  - Notification list with type icons
  - Mark as read functionality
  - Mark all as read
  - Delete notifications
  - Clear all
  - Unread count badge
- Notification types: message, achievement, alert, mention, invite, event

#### `LivePresenceBar.jsx`
- Real-time presence display
- Shows active editors with typing indicators
- Uses PresenceBadge for state display

#### `PresenceBadge.jsx`
- Presence state indicator
- Color-coded by state
- Size variants

#### `AnimatedBackground.jsx`
- Animated background component

#### `SuccessCelebration.jsx`
- Celebration animation for achievements

#### `CustomVideoPlayer.jsx`
- Custom video player for FunFlix

#### `WatchPartySync.jsx`
- Watch party synchronization

#### `AIResearchAssistant.jsx`
- AI-powered research assistance

#### `PeerReviewPanel.jsx`
- Peer review interface for research

#### `ResearchMilestones.jsx`
- Research milestone tracking

#### `PageTransition.jsx`
- Page transition animations

---

## Routing Structure & Navigation

### Router Configuration (`Router.jsx`)

**Architecture:**
- React Router v6 with lazy loading for all routes
- Protected routes with authentication and role checks
- Suspense with full-screen loader

**Route Protection:**
- `ProtectedRoute`: Wrapper for authenticated routes
  - `requireAuth`: Require authentication (default)
  - `requireMember`: Require approved membership
  - `requireCeo`: Require CEO permissions
  - `requireAdmin`: Require admin permissions
- `AuthRoute`: Prevent authenticated users from accessing auth pages

---

### Public Routes

**Authentication:**
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/access-denied` - Access denied page

**Public Pages:**
- `/` - Public home
- `/about` - About page
- `/experiments` - Public experiments showcase
- `/public-marketplace` - Public marketplace
- `/projects` - Public projects
- `/hall-of-fame` - Hall of fame
- `/join` - Join page
- `/members/:uid` - Public member profile
- `/u/:username` - Public user page

---

### Protected Routes (AppShell)

**Core Application:**
- `/dashboard` - Main dashboard
- `/universe` - Universe home
- `/universe/goals` - Universe goals
- `/universe/graph` - Knowledge graph
- `/search` - Unified search
- `/tasks` - Tasks hub
- `/chat` - Chat page
- `/communities` - Communities page
- `/communities/:communityId` - Community detail
- `/discover` - Discover page
- `/workspace` - Workspace dashboard
- `/workspace/:id` - Workspace detail
- `/profile` - Profile page
- `/profile/:uid` - User profile
- `/profile/:uid/edit` - Profile edit
- `/settings` - Settings
- `/leaderboards` - Leaderboards
- `/notifications` - Notifications center

**Workspace Features:**
- `/workspace/experiments` - Experiments lab (member only)
- `/workspace/experiments/:experimentId` - Experiment detail
- `/workspace/products` - Products marketplace (member only)
- `/workspace/products/:productId` - Product detail
- `/workspace/creative` - Creative hub
- `/workspace/creative/:id` - Creative detail
- `/workspace/skills` - Skills hub
- `/workspace/skills/:skillId` - Skill detail

**Organization:**
- `/organization` - Organization hub
- `/organization/division/:id` - Division dashboard
- `/organization/department/:id` - Department dashboard
- `/organization/lab/:id` - Lab dashboard
- `/organization/team/:id` - Team dashboard
- `/operations` - Operations center

**Collaboration:**
- `/activity` - Activity stream
- `/collaboration` - Collaboration hub

**Governance:**
- `/governance` - Governance center
- `/governance/elections` - Elections hub
- `/governance/verification` - Verification center
- `/governance/conflict` - Conflict resolution
- `/governance/ai` - AI governance assistant
- `/governance/health` - Organization health (CEO only)
- `/governance/departments` - Department management (CEO only)
- `/governance/teams` - Team management (CEO only)
- `/governance/proposals` - Proposal center (CEO only)
- `/governance/meetings` - Meeting center (CEO only)
- `/governance/policies` - Policy center (CEO only)
- `/governance/audit` - Audit logs (CEO only)
- `/governance/structure` - Organization structure (CEO only)
- `/governance/voting` - Voting system (CEO only)
- `/governance/decisions` - Decision history (CEO only)
- `/governance/automation` - Automation control (CEO only)
- `/governance/analytics` - Governance analytics (CEO only)

**Research System:**
- `/research/fun-mode` - Fun research mode
- `/research/challenges` - Research challenges
- `/research/discovery` - Discovery feed
- `/research/arena` - Research arena
- `/research/simulator` - AI research simulator
- `/research/analytics` - Research analytics
- `/research/certificates` - Research certificates
- `/research/featured` - Featured research
- `/research/leaderboards` - Research leaderboards
- `/research/levels` - Research levels
- `/research/builder` - Research builder wizard
- `/research/coauthor` - AI co-author
- `/research/collaboration` - Research collaboration
- `/research/notebook` - Research notebook
- `/research/media` - Media support
- `/research/experiments` - Experiment connection
- `/research/reviewer` - AI research reviewer
- `/research/discussion` - Discussion area
- `/research/gamification` - Teen gamification

**Community System:**
- `/community` - Communities system
- `/community/rooms` - Discussion rooms
- `/community/qa` - Questions & answers
- `/community/polls` - Advanced polls
- `/community/events` - Events feed
- `/community/spotlight` - Member spotlight
- `/community/challenges` - Community challenges
- `/community/collaboration` - Collaboration board
- `/community/knowledge` - Knowledge sharing
- `/community/gallery` - Community gallery
- `/community/achievements` - Achievements feed
- `/community/discover` - Discover members
- `/community/reputation` - Community reputation
- `/community/leaderboards` - Community leaderboards
- `/community/assistant` - AI community assistant
- `/community/search` - Community search
- `/community/moderation` - Community moderation

**Chat System:**
- `/chat/composer` - Rich message composer
- `/chat/effects` - Fun chat effects
- `/chat/ai` - AI inside chat
- `/chat/voice` - Voice messages
- `/chat/rooms` - Voice rooms
- `/chat/video` - Video meetings
- `/chat/media` - Shared media
- `/chat/games` - Chat games
- `/chat/achievements` - Achievement celebrations
- `/chat/profiles` - Member profiles in chat
- `/chat/filters` - Smart filters
- `/chat/mobile` - Mobile chat experience

**AI Studio:**
- `/ai-studio` - AI studio unified
- `/ai-studio/prompt-center` - Prompt engineering center
- `/ai-studio/playground` - Interactive prompt playground
- `/ai-studio/analyzer` - Prompt analyzer
- `/ai-studio/challenges` - Prompt challenges
- `/ai-studio/training` - AI training center
- `/ai-studio/knowledge` - Knowledge sources
- `/ai-studio/testing` - AI testing lab
- `/ai-studio/analytics` - AI analytics
- `/ai-studio/collaboration` - AI collaboration
- `/ai-studio/version-control` - AI version control
- `/ai-studio/collections` - AI collections
- `/ai-studio/competitions` - AI competitions
- `/ai-studio/community` - AI community
- `/ai-studio/achievements` - AI achievements
- `/ai-studio/academy` - AI learning academy
- `/ai-studio/fun` - Fun AI features

**FunFlix:**
- `/funflix` - FunFlix hub
- `/funflix/watch/:movieId` - Movie player
- `/funflix/studio` - Creator studio (member only)
- `/funflix/creator/:username` - Creator profile
- `/funflix/upload` - Movie upload wizard (member only)
- `/funflix/playlists` - Movie playlists (member only)
- `/funflix/ai` - AI FunFlix assistant
- `/funflix/challenges` - FunFlix challenges
- Additional FunFlix routes for various features

**Ventures:**
- `/ventures` - Ventures unified
- `/ventures/explore` - Venture directory
- `/ventures/:id` - Venture detail
- `/ai-venture` - AI venture assistant

**Portfolios:**
- `/portfolios` - Portfolio showcase
- `/portfolio/:username` - Portfolio page
- `/portfolio/:username/share` - Portfolio share
- `/verify/:certId` - Certificate view
- Additional portfolio section routes

**Events & Challenges:**
- `/events` - Events page
- `/events/:eventId` - Event detail
- `/challenges/:challengeId` - Challenge detail

**Knowledge Base:**
- `/knowledge` - Knowledge hub
- `/knowledge/article/new` - Article editor
- `/knowledge/article/:id` - Article viewer
- `/knowledge/maps` - Knowledge map
- `/knowledge/collections` - Smart collections
- `/knowledge/paths` - Learning paths

**Developer & Integrations:**
- `/developer` - Developer portal
- `/developer/keys` - API keys center
- `/developer/webhooks` - Webhook center
- `/developer/sdks` - SDK center
- `/developer/marketplace` - Developer marketplace
- `/integrations/ai-providers` - AI provider center
- `/integrations/productivity` - Productivity integrations
- `/integrations/research` - Research integrations
- `/integrations/learning` - Learning integrations
- `/integrations/communication` - Communication hub
- `/integrations/enterprise` - Enterprise integrations
- `/integrations/security` - Integration security center

**Global Ecosystem:**
- `/global/communities` - Community network
- `/global/organizations` - Organization network
- `/global/events` - Global events hub
- `/global/search` - Global search center
- `/global/compliance` - Compliance center
- `/mission-control/global` - Global mission control
- `/admin/global` - Admin global ecosystem

**Legacy:**
- `/legacy` - Legacy center
- `/legacy/hall-of-fame` - Legacy hall of fame
- `/legacy/recognition` - Recognition center
- `/legacy/timeline` - Timeline center
- `/legacy/rankings` - Global rankings

**Platform:**
- `/platform/security` - Security center
- `/platform/seo` - SEO health center
- `/platform/monitoring` - Monitoring center
- `/platform/backup` - Backup center
- `/platform/docs` - Documentation center
- `/platform/launch` - Launch center
- `/platform/certification` - Platform certification center
- `/platform/releases` - Release manager

**AI Creator Studio:**
- `/ai-studio` - AI studio unified
- `/ais` - AI marketplace browser
- `/ais/:aiId` - AI profile page
- `/ais/:aiId/chat` - AI chat page

**Intelligence:**
- `/intelligence/trends` - Trend analytics
- `/intelligence/reports` - Reports automation
- `/intelligence/alerts` - Intelligence alerts
- `/intelligence/ai` - AI executive advisor

**Ecosystem:**
- `/ecosystem` - Ecosystem hub
- `/ecosystem/chapters` - Chapters hub
- `/ecosystem/ambassadors` - Ambassador hub
- `/ecosystem/institutions` - Institution hub
- `/ecosystem/programs` - Programs hub

**Presence:**
- `/presence/status` - Presence status
- `/presence/rich` - Rich presence
- `/presence/last-seen` - Last seen
- `/presence/device` - Active device
- `/presence/privacy` - Presence privacy
- `/presence/chat` - Presence in chat
- `/presence/community` - Presence in community
- `/presence/executive` - Executive presence
- `/presence/architecture` - Technical architecture
- `/presence/failure` - Failure handling
- `/presence/design` - Presence design

---

### CEO/Executive Routes

**Command Center:**
- `/ceo-panel` - CEO panel
- `/command-center` - Command center
- `/membership-center` - Membership center
- `/executive-ai` - Executive AI assistant

**Mission Control:**
- `/mission-control` - Mission control layout
- `/mission-control/dashboard` - Dashboard
- `/mission-control/alerts` - Executive alerts
- `/mission-control/projects` - Project health
- `/mission-control/org` - Organization health
- `/mission-control/members` - Member analytics
- `/mission-control/search` - Global search
- `/mission-control/reports` - Reports center
- `/mission-control/ai` - AI insights
- `/mission-control/innovation` - Innovation health
- `/mission-control/ventures` - Venture health
- `/mission-control/universe` - Universe analytics
- `/mission-control/knowledge` - Knowledge analytics
- `/mission-control/funflix` - FunFlix analytics
- `/mission-control/ai-ecosystem` - AI ecosystem analytics

---

### Admin Routes

**Admin Layout:**
- `/admin` - Admin layout (redirects to dashboard)
- `/admin/dashboard` - Admin dashboard
- `/admin/members` - Admin members
- `/admin/memberships` - Admin memberships
- `/admin/roles` - Admin roles
- `/admin/content` - Admin content
- `/admin/gamification` - Admin gamification
- `/admin/audit-logs` - Admin audit logs
- `/admin/analytics` - Admin analytics
- `/admin/security` - Admin security
- `/admin/events` - Admin events
- `/admin/innovation` - Admin innovation
- `/admin/ventures` - Admin ventures
- `/admin/universe` - Admin universe
- `/admin/collaboration` - Admin collaboration
- `/admin/organization` - Admin organization
- `/admin/knowledge` - Admin knowledge
- `/admin/governance` - Admin governance
- `/admin/intelligence` - Admin intelligence
- `/admin/ecosystem` - Admin ecosystem
- `/admin/funflix` - Admin FunFlix
- `/admin/ai-studio` - Admin AI studio
- `/admin/global` - Admin global ecosystem

---

### Membership Routes

- `/membership/apply` - Membership application

---

### 404 Fallback

- `*` - NotFound component

---

## Firestore Security Rules

### Security Architecture

**Version:** Firestore Rules v2  
**Strategy:** Defense-in-depth with role-based access control (RBAC)

---

### Helper Functions

#### Authentication & Role Checks
```javascript
isAuthenticated()          // Check if user is authenticated
getUserData()              // Get user document
getUserRole()              // Get user role
isMainCEO()                // Check if Main CEO
isCoCEO()                  // Check if Co-CEO
isLeader()                 // Check if Leader
isMember()                 // Check if approved member
isApprovedMember()         // Check approved membership status
```

#### Permission Functions
```javascript
canManageMembers()         // Main CEO or Co-CEO
canDeleteContent()         // Main CEO, Co-CEO, or Leader
canCreateAnnouncements()   // Main CEO, Co-CEO, or Leader
canManageOrganization()    // Main CEO, Co-CEO, or Leader
canReviewTasks()           // Leader or canManageMembers
```

#### Chat Room Functions
```javascript
isPublicChatRoom()         // Check if public room
isAnnouncementRoom()       // Check if announcement room
chatRoomType()             // Get room type
isDefaultChatRoom()        // Check if default room
```

---

### Collection Rules

#### User Collections

**`/usernames/{username}`**
- Read: Authenticated users
- Create: Authenticated, uid matches
- Update/Delete: canManageMembers

**`/users/{userId}`**
- Read: Authenticated users
- Create: Own document, role=User, membershipStatus=none (or Main CEO)
- Update: 
  - Own safe fields (displayName, avatar, phoneNumber, profileCustomization)
  - Task reviewers can update xp, level, stats, updatedAt
  - Self XP/stats updates for experiments
  - CEOs can update xp, level, stats, updatedAt
  - Self reputation updates
  - Self skillXp and skillStats updates
  - canManageMembers for full updates
- Delete: Main CEO only

**User Subcollections:**
- `/users/{userId}/notifications/{notificationId}`: Read own, create by system/CEOs or self for specific types
- `/users/{userId}/aiHistory/{historyId}`: Read/write own
- `/users/{userId}/badges/{badgeId}`: Read authenticated, write by canManageMembers
- `/users/{userId}/achievements/{achievementId}`: Read authenticated, write by canManageMembers

**`/publicProfiles/{userId}`**
- Read: Public (no auth required)
- Create: Authenticated, own document, role=User
- Update: Own document with specific fields
- Update/Delete: canManageMembers

**`/membershipApplications/{applicationId}`**
- Create: Authenticated, own application
- Read: Own application only
- Update/Delete: Not allowed

---

#### Organization Collections

**`/teams/{teamId}`**
- Read: Authenticated
- Create: Members
- Update: Members who are leader or canManageMembers
- Delete: canManageMembers

**`/divisions/{divisionId}`**
- Read: Authenticated
- Create: canManageMembers with field validation
- Update: canManageMembers with field restrictions
- Delete: canManageMembers

**`/departments/{departmentId}`**
- Read: Authenticated
- Create: canManageMembers with field validation
- Update: canManageMembers with field restrictions
- Delete: canManageMembers

**`/labs/{labId}`**
- Read: Authenticated
- Create: canManageMembers with field validation
- Update: canManageMembers with field restrictions
- Delete: canManageMembers

**`/projects/{projectId}`**
- Read: Public
- Create: Members with field validation
- Update: Members who are owner or in memberIds, or canManageMembers
- Delete: canManageMembers

**`/organizationAnnouncements/{id}`**
- Read: Authenticated
- Write: canManageMembers

---

#### Content Collections

**`/products/{productId}`**
- Read: Public
- Create: Members/CEOs, own creatorId, field validation
- Update: 
  - Own creatorId with field restrictions
  - Anyone can update likes
  - Anyone can update views
  - canDeleteContent can update featured, status
- Delete: Own creatorId or canDeleteContent
- Comments: Read authenticated, create own, update/delete own or canDeleteContent

**`/experiments/{experimentId}`**
- Read: Public
- Create: Members/CEOs, own authorId, field validation
- Update: 
  - Own authorId with field restrictions
  - Anyone can update likes
  - Anyone can update views
  - canDeleteContent can update featured, status
- Delete: Own authorId or canDeleteContent
- Comments: Read authenticated, create own, update/delete own or canDeleteContent

**`/skills/{skillId}`**
- Read: Authenticated
- Create: canManageMembers with field validation
- Update/Delete: canManageMembers

**`/specializations/{specializationId}`**
- Read: Authenticated
- Write: canManageMembers

**`/achievements/{achievementId}`**
- Read: Authenticated
- Write: canManageMembers

**`/skillPosts/{postId}`**
- Read: Authenticated
- Create: Members, own authorId, field validation
- Update/Delete: Own authorId or canDeleteContent

**`/resources/{resourceId}`**
- Read: Authenticated
- Create: Members, own authorId, field validation
- Update: canDeleteContent for featured, own authorId for other fields
- Delete: Own authorId

**`/creative_works/{workId}`**
- Read: Public
- Create: Authenticated, own creatorId, field validation
- Update: 
  - Own creatorId with field restrictions
  - Anyone can update likes
  - Anyone can update views
  - canDeleteContent can update featured
- Delete: Own creatorId or canDeleteContent
- Comments: Read authenticated, create own, delete own or canDeleteContent

**`/chat_channels/{channelId}`**
- Read: Authenticated
- Create: Members or CEOs
- Update: Own creatorId or canManageMembers
- Delete: Own creatorId or canManageMembers
- Messages: Read authenticated, create own, update/delete own

**`/chatRooms/{roomId}`**
- Read: Authenticated
- Create: canManageMembers with field validation
- Update: canManageMembers for archived
- Delete: canManageMembers
- Messages: Read authenticated, create own senderId

---

#### AI Collections

**`/custom_ais/{aiId}`**
- Read: Authenticated
- Create: Authenticated, own creatorId
- Update: Own creatorId
- Delete: Own creatorId

**`/ai_studio_stats/{statId}`**
- Read: Own userId
- Create: Authenticated, own userId
- Update: Own userId
- Delete: Own userId

---

### Security Principles

1. **Principle of Least Privilege:** Users only have access to what they need
2. **Field-Level Validation:** Strict field validation on creates and updates
3. **Ownership Verification:** Users can only modify their own content
4. **Role-Based Access:** Administrative functions restricted to specific roles
5. **Public Read for Content:** Most content is publicly readable
6. **Authenticated Writes:** All writes require authentication
7. **Transaction Safety:** XP and stats updates use atomic transactions
8. **Audit Trail:** All organizational changes logged

---

## Storage Security Rules

### Security Architecture

**Version:** Firebase Storage Rules v2  
**Strategy:** Path-based access control with Firestore data verification

---

### Helper Functions

```javascript
isAuthenticated()          // Check if user is authenticated
isOwner(userId)            // Check if user owns the resource
isMainCEO()                // Check if Main CEO
isCoCEO()                  // Check if Co-CEO
isLeader()                 // Check if Leader
isMember()                 // Check if approved member
canManageMembers()         // Main CEO or Co-CEO
isTeamMember(teamId)       // Check if team member
isProductOwner(productId)  // Check if product owner
isExperimentAuthor(experimentId)  // Check if experiment author
```

---

### Path Rules

#### User Storage
**`/users/{userId}/{allPaths=**}`**
- Read: Authenticated, own userId
- Write: Authenticated, own userId

#### Team Storage
**`/teams/{teamId}/{allPaths=**}`**
- Read: Authenticated, team member
- Write: Authenticated, team member or canManageMembers

#### Product Storage
**`/products/{productId}/{allPaths=**}`**
- Read: Authenticated, product owner
- Write: Authenticated, product owner or canManageMembers

#### Public Storage
**`/public/{allPaths=**}`**
- Read: Public (no auth required)
- Write: Not allowed

#### Avatar Storage
**`/avatars/{userId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, own userId

#### Experiment Storage
**`/experiments/{experimentId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, experiment author or Leader

#### Creative Works Storage
**`/creative/{workId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, creative work creator or Leader

#### FunFlix Storage
**`/funflix/{videoId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, video creator or Leader

#### Marketplace Storage
**`/marketplace/{itemId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, marketplace item creator or Leader

#### Certificate Storage
**`/certificates/{certificateId}/{allPaths=**}`**
- Read: Authenticated
- Write: canManageMembers

#### Skills Storage
**`/skills/{skillId}/{allPaths=**}`**
- Read: Authenticated
- Write: canManageMembers

#### Documents Storage
**`/documents/{documentId}/{allPaths=**}`**
- Read: Authenticated
- Write: Authenticated, document creator or Leader

#### Temporary Uploads
**`/temp/{userId}/{allPaths=**}`**
- Read: Authenticated, own userId
- Write: Authenticated, own userId

#### Default Deny
**`/{allPaths=**}`**
- Read/Write: Denied (default deny)

---

### Security Principles

1. **Path Isolation:** Each content type has isolated storage paths
2. **Ownership Verification:** Storage access verified against Firestore data
3. **Public Read for Public Content:** Public folder accessible without auth
4. **Authenticated Writes:** All writes require authentication
5. **Admin Override:** CEOs can override most restrictions
6. **Temporary Isolation:** Temporary uploads isolated by user
7. **Default Deny:** Unknown paths denied by default

---

## State Management

### Zustand Stores

#### `useGlobalStore`
**Purpose:** Global application state

**State:**
- `isSidebarCollapsed`: Sidebar collapse state
- `isMobileDrawerOpen`: Mobile drawer state
- `isPresencePanelOpen`: Presence panel state
- `toggleSidebar()`: Toggle sidebar
- `toggleMobileDrawer()`: Toggle mobile drawer
- `togglePresencePanel()`: Toggle presence panel

#### `usePresenceStore`
**Purpose:** Real-time presence state

**State:**
- `onlineMembers`: Map of online members with presence data
- `updatePresence()`: Update presence data
- `removePresence()`: Remove presence data

#### `useAuth` (AuthContext)
**Purpose:** Authentication state

**State:**
- `user`: Firebase auth user
- `roleData`: User role and permissions
- `isAuthInitialized`: Auth initialization status
- `loading`: Loading state
- `signIn()`, `signUp()`, `signOut()`: Auth methods

---

## Authentication & Authorization

### Authentication Flow

1. **Sign Up:**
   - User creates account with email/password
   - User document created with role='User', membershipStatus='none'
   - Username reserved in `/usernames` collection

2. **Sign In:**
   - User authenticates with Firebase Auth
   - User document fetched from `/users/{uid}`
   - Role data loaded for permissions

3. **Membership Application:**
   - User submits membership application
   - Application stored in `/membershipApplications`
   - CEOs review and approve/reject

4. **Role Assignment:**
   - CEOs can assign roles (Main CEO, Co-CEO, Leader)
   - Roles stored in user document
   - Permissions derived from role

---

### Authorization Model

**Roles:**
- `Main CEO`: Full administrative access
- `Co-CEO`: Full administrative access (except Main CEO deletion)
- `Leader`: Limited administrative access (content review, some management)
- `User`: Standard user access
- `Guest`: Unauthenticated user

**Membership Status:**
- `none`: Non-member (limited access)
- `pending`: Membership application pending
- `approved`: Approved member (full access)
- `rejected`: Membership rejected

**Permissions:**
- `canAccessCeoPanel`: Main CEO or Co-CEO
- `canAccessAdmin`: Main CEO, Co-CEO, or Leader
- `canManageMembers`: Main CEO or Co-CEO
- `canDeleteContent`: Main CEO, Co-CEO, or Leader
- `canCreateAnnouncements`: Main CEO, Co-CEO, or Leader
- `canManageOrganization`: Main CEO, Co-CEO, or Leader
- `canReviewTasks`: Leader or canManageMembers

---

## Data Models & Collections

### Core Collections

#### `users`
User profiles with authentication and gamification data

**Fields:**
- `uid`: User ID (matches auth UID)
- `username`: Unique username
- `displayName`: Display name
- `avatar`: Profile image URL
- `email`: Email address
- `phoneNumber`: Phone number
- `role`: User role (Main CEO, Co-CEO, Leader, User)
- `membershipStatus`: Membership status (none, pending, approved, rejected)
- `xp`: Total experience points
- `level`: User level (calculated from XP)
- `skillXp`: Skill-specific XP object
- `skillStats`: Skill statistics object
- `stats`: General statistics object
- `reputation`: Reputation score
- `specializations`: Array of specialization IDs
- `achievements`: Array of achievement IDs
- `certificates`: Array of certificate IDs
- `profileCustomization`: Profile customization options
- `joinedAt`: Join timestamp
- `updatedAt`: Last update timestamp

#### `usernames`
Username reservation for uniqueness

**Fields:**
- `uid`: User ID
- `username`: Username

#### `publicProfiles`
Publicly accessible profile data

**Fields:**
- Same as users but with public-safe fields only

#### `membershipApplications`
Membership applications

**Fields:**
- `applicantId`: Applicant user ID
- `applicantName`: Applicant name
- `motivation`: Application motivation
- `status`: Application status (pending, approved, rejected)
- `createdAt`: Application timestamp

---

### Organization Collections

#### `divisions`
Top-level organizational divisions

**Fields:**
- `name`: Division name
- `description`: Division description
- `leadId`: Division leader user ID
- `archived`: Archive status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `departments`
Departments within divisions

**Fields:**
- `name`: Department name
- `description`: Department description
- `divisionId`: Parent division ID
- `leaderId`: Department leader user ID
- `memberCount`: Member count
- `goals`: Department goals
- `milestones`: Department milestones
- `initiatives`: Department initiatives
- `archived`: Archive status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `labs`
Labs within departments

**Fields:**
- `name`: Lab name
- `description`: Lab description
- `departmentId`: Parent department ID
- `leadId`: Lab leader user ID
- `archived`: Archive status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `projects`
Projects within labs or departments

**Fields:**
- `title`: Project title
- `description`: Project description
- `departmentId`: Parent department ID
- `labId`: Parent lab ID
- `ownerId`: Project owner user ID
- `memberIds`: Array of member user IDs
- `status`: Project status (PLANNING, ACTIVE, ON_HOLD, COMPLETED)
- `progressPercent`: Progress percentage
- `startDate`: Start date
- `targetDate`: Target completion date
- `tasks`: Project tasks
- `files`: Project files
- `activity`: Project activity log
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `teams`
Flexible team groups

**Fields:**
- `name`: Team name
- `description`: Team description
- `departmentId`: Associated department ID
- `labId`: Associated lab ID
- `projectId`: Associated project ID
- `leaderId`: Team leader user ID
- `members`: Array of member user IDs
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `organizationAnnouncements`
Organization-wide announcements

**Fields:**
- `title`: Announcement title
- `content`: Announcement content
- `authorId`: Author user ID
- `priority`: Priority level
- `createdAt`: Creation timestamp

---

### Content Collections

#### `products`
Marketplace products

**Fields:**
- `title`: Product title
- `description`: Product description
- `category`: Product category
- `creatorId`: Creator user ID
- `creatorName`: Creator display name
- `creatorUsername`: Creator username
- `teamMembers`: Array of team member user IDs
- `price`: Product price
- `status`: Product status (DRAFT, SHOWCASE, AVAILABLE, SOLD_OUT, ARCHIVED)
- `media`: Array of media URLs
- `features`: Product features
- `technicalDetails`: Technical specifications
- `usageInstructions`: Usage instructions
- `warrantyInfo`: Warranty information
- `likes`: Array of liker user IDs
- `views`: View count
- `featured`: Featured status
- `workspaceId`: Associated workspace ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `experiments`
Scientific experiments

**Fields:**
- `title`: Experiment title
- `description`: Experiment description
- `category`: Experiment category
- `difficulty`: Difficulty level
- `status`: Experiment status (PLANNING, IN_PROGRESS, COMPLETED, FAILED)
- `authorId`: Author user ID
- `authorName`: Author display name
- `authorUsername`: Author username
- `teamMembers`: Array of team member user IDs
- `media`: Array of media URLs
- `materials`: Required materials
- `procedure`: Experimental procedure
- `results`: Experiment results
- `lessonsLearned`: Lessons learned
- `likes`: Array of liker user IDs
- `views`: View count
- `featured`: Featured status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `creative_works`
Creative works and art

**Fields:**
- `title`: Work title
- `description`: Work description
- `category`: Work category
- `creatorId`: Creator user ID
- `creatorName`: Creator display name
- `creatorUsername`: Creator username
- `media`: Array of media URLs
- `likes`: Array of liker user IDs
- `views`: View count
- `featured`: Featured status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `skills`
Skill definitions

**Fields:**
- `name`: Skill name
- `overview`: Skill overview
- `description`: Skill description
- `category`: Skill category
- `badge`: Badge identifier
- `featured`: Featured status
- `createdBy`: Creator user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `skillPosts`
Posts within skills

**Fields:**
- `skillId`: Parent skill ID
- `type`: Post type (Discussion, Question, Guide, Tutorial, Challenge, Resource, Discovery)
- `title`: Post title
- `body`: Post body content
- `authorId`: Author user ID
- `authorName`: Author display name
- `featured`: Featured status
- `likes`: Array of liker user IDs
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `resources`
Learning resources

**Fields:**
- `skillId`: Parent skill ID
- `type`: Resource type (book, PDF, video, website, article)
- `title`: Resource title
- `description`: Resource description
- `url`: Resource URL
- `authorId`: Author user ID
- `authorName`: Author display name
- `featured`: Featured status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `research`
Research papers

**Fields:**
- `title`: Research title
- `abstract`: Research abstract
- `content`: Research content
- `authorId`: Author user ID
- `authorName`: Author display name
- `authorUsername`: Author username
- `collaborators`: Array of collaborator user IDs
- `status`: Research status (DRAFT, PUBLISHED, ARCHIVED)
- `category`: Research category
- `tags`: Array of tags
- `xp`: Research XP
- `level`: Research level
- `likes`: Array of liker user IDs
- `views`: View count
- `bookmarks`: Array of bookmarking user IDs
- `featured`: Featured status
- `certificateId`: Associated certificate ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `marketplace`
Marketplace resources

**Fields:**
- `title`: Resource title
- `description`: Resource description
- `type`: Resource type (resource, service, bundle)
- `category`: Resource category
- `creatorId`: Creator user ID
- `creatorName`: Creator display name
- `creatorUsername`: Creator username
- `price`: Resource price
- `status`: Resource status (DRAFT, AVAILABLE, SOLD_OUT, ARCHIVED)
- `media`: Array of media URLs
- `downloads`: Download count
- `views`: View count
- `likes`: Array of liker user IDs
- `featured`: Featured status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `funflix_videos`
FunFlix video content

**Fields:**
- `title`: Video title
- `description`: Video description
- `creatorId`: Creator user ID
- `creatorName`: Creator display name
- `creatorUsername`: Creator username
- `videoUrl`: Video URL
- `thumbnailUrl`: Thumbnail URL
- `category`: Video category
- `duration`: Video duration
- `views`: View count
- `likes`: Array of liker user IDs
- `featured`: Featured status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

### Gamification Collections

#### `xpLogs`
XP award logs

**Fields:**
- `userId`: User ID
- `amount`: XP amount
- `reason`: Award reason
- `sourceType`: Source type
- `sourceId`: Source entity ID
- `actorId`: Actor user ID
- `createdAt`: Award timestamp

#### `skillXpLogs`
Skill-specific XP logs

**Fields:**
- `userId`: User ID
- `skillId`: Skill ID
- `amount`: XP amount
- `reason`: Award reason
- `sourceType`: Source type
- `sourceId`: Source entity ID
- `actorId`: Actor user ID
- `createdAt`: Award timestamp

#### `achievements`
Achievement definitions

**Fields:**
- `id`: Achievement ID
- `name`: Achievement name
- `description`: Achievement description
- `icon`: Achievement icon
- `xpReward`: XP reward
- `criteria`: Achievement criteria
- `createdAt`: Creation timestamp

#### `specializations`
Specialization definitions

**Fields:**
- `id`: Specialization ID
- `name`: Specialization name
- `description`: Specialization description
- `badge`: Badge identifier
- `requirements`: Requirements
- `createdAt`: Creation timestamp

---

### Governance Collections

#### `organizationHealth`
Organization health metrics

**Fields:**
- `overallHealth`: Overall health score
- `memberEngagement`: Member engagement score
- `projectCompletion`: Project completion rate
- `innovationIndex`: Innovation index
- `collaborationScore`: Collaboration score
- `timestamp`: Metric timestamp

#### `proposals`
Governance proposals

**Fields:**
- `title`: Proposal title
- `description`: Proposal description
- `authorId`: Author user ID
- `status`: Proposal status (DRAFT, ACTIVE, VOTING, APPROVED, REJECTED)
- `votes`: Vote object
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `votes`
Vote records

**Fields:**
- `proposalId`: Parent proposal ID
- `userId`: Voter user ID
- `vote`: Vote value (for, against, abstain)
- `timestamp`: Vote timestamp

#### `elections`
Leadership elections

**Fields:**
- `title`: Election title
- `description`: Election description
- `position`: Position being elected
- `candidates`: Array of candidate user IDs
- `status`: Election status (DRAFT, ACTIVE, COMPLETED)
- `votes`: Vote object
- `winnerId`: Winner user ID
- `startDate`: Start date
- `endDate`: End date
- `createdAt`: Creation timestamp

#### `verifications`
User verifications

**Fields:**
- `userId`: User ID
- `type`: Verification type
- `status`: Verification status (PENDING, APPROVED, REJECTED)
- `evidence`: Evidence URLs
- `reviewerId`: Reviewer user ID
- `reviewNotes`: Review notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `conflicts`
Conflict resolution cases

**Fields:**
- `title`: Conflict title
- `description`: Conflict description
- `parties`: Array of involved party user IDs
- `status`: Conflict status (OPEN, IN_PROGRESS, RESOLVED)
- `mediatorId`: Mediator user ID
- `resolution`: Resolution description
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `policies`
Organizational policies

**Fields:**
- `title`: Policy title
- `content`: Policy content
- `authorId`: Author user ID
- `status`: Policy status (DRAFT, ACTIVE, ARCHIVED)
- `version`: Policy version
- `effectiveDate`: Effective date
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `meetings`
Meeting records

**Fields:**
- `title`: Meeting title
- `description`: Meeting description
- `organizerId`: Organizer user ID
- `participants`: Array of participant user IDs
- `scheduledDate`: Scheduled date
- `duration`: Duration
- `status`: Meeting status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `minutes`: Meeting minutes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `auditLogs`
Audit trail

**Fields:**
- `action`: Action performed
- `actorId`: Actor user ID
- `targetId`: Target entity ID
- `targetType`: Target entity type
- `changes`: Changes made
- `timestamp`: Action timestamp

---

### Venture Collections

#### `ventures`
Startup/venture records

**Fields:**
- `name`: Venture name
- `description`: Venture description
- `founderId`: Founder user ID
- `visibility`: Visibility level (PRIVATE, TEAM_ONLY, ORGANIZATION_VISIBLE, PUBLIC_SHOWCASE)
- `lifecycleStage`: Lifecycle stage (IDEA, RESEARCH, VALIDATION, PROTOTYPE, MVP, TESTING, EARLY_USERS, GROWTH, SCALING, ENTERPRISE, GLOBAL, LEGACY)
- `healthScore`: Health score
- `fundingSimulation`: Funding simulation data
- `stats`: Venture statistics
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `ventureMembers`
Venture membership

**Fields:**
- `ventureId`: Venture ID
- `userId`: User ID
- `role`: Member role (FOUNDER, MEMBER)
- `joinedAt`: Join timestamp

#### `ventureLinks`
Links to other entities

**Fields:**
- `ventureId`: Venture ID
- `entityType`: Entity type (RESEARCH, INVENTION, PRODUCT, PROJECT)
- `entityId`: Entity ID
- `metadata`: Additional metadata
- `linkedAt`: Link timestamp

---

### Workspace Collections

#### `workspaces`
Digital workspaces

**Fields:**
- `name`: Workspace name
- `description`: Workspace description
- `ownerId`: Owner user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `workspaceMembers`
Workspace membership

**Fields:**
- `workspaceId`: Workspace ID
- `userId`: User ID
- `role`: Member role (OWNER, MEMBER)
- `joinedAt`: Join timestamp

#### `documents`
Workspace documents

**Fields:**
- `title`: Document title
- `content`: Document content
- `workspaceId`: Parent workspace ID
- `createdBy`: Creator user ID
- `createdAt`: Creation timestamp
- `lastEditedAt`: Last edit timestamp

#### `documentVersions`
Document versions

**Fields:**
- `documentId`: Parent document ID
- `content`: Version content
- `savedBy`: Saver user ID
- `timestamp`: Save timestamp

#### `notes`
Workspace notes

**Fields:**
- `title`: Note title
- `content`: Note content
- `workspaceId`: Parent workspace ID
- `createdAt`: Creation timestamp

#### `researchNotebooks`
Research notebooks

**Fields:**
- `title`: Notebook title
- `workspaceId`: Parent workspace ID
- `createdAt`: Creation timestamp

#### `whiteboards`
Whiteboard canvases

**Fields:**
- `title`: Whiteboard title
- `content`: Whiteboard content
- `workspaceId`: Parent workspace ID
- `createdAt`: Creation timestamp

#### `mindMaps`
Mind map canvases

**Fields:**
- `title`: Mind map title
- `content`: Mind map content
- `workspaceId`: Parent workspace ID
- `createdAt`: Creation timestamp

#### `workspaceActivity`
Workspace activity logs

**Fields:**
- `workspaceId`: Workspace ID
- `userId`: User ID
- `action`: Action performed
- `timestamp`: Action timestamp

---

### Certificate Collections

#### `certificates`
Digital certificates

**Fields:**
- `id`: Certificate ID
- `userId`: Recipient user ID
- `programId`: Program ID
- `programName`: Program name
- `issueDate`: Issue date
- `expiryDate`: Expiry date
- `verificationCode`: Unique verification code
- `certNumber`: Certificate number
- `status`: Certificate status (ACTIVE, REVOKED)
- `revokedAt`: Revocation timestamp
- `revokedBy`: Revoker user ID
- `revocationReason`: Revocation reason

#### `certificatePrograms`
Certificate program definitions

**Fields:**
- `id`: Program ID
- `name`: Program name
- `description`: Program description
- `requirements`: Program requirements
- `duration`: Program duration
- `badge`: Badge identifier
- `createdAt`: Creation timestamp

---

### AI Collections

#### `custom_ais`
Custom AI assistants

**Fields:**
- `id`: AI ID
- `name`: AI name
- `description`: AI description
- `creatorId`: Creator user ID
- `promptSystem`: System prompt
- `model`: AI model
- `settings`: AI settings
- `usageStats`: Usage statistics
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `ai_studio_stats`
AI studio usage statistics

**Fields:**
- `userId`: User ID
- `totalPrompts`: Total prompts sent
- `totalTokens`: Total tokens used
- `aiInteractions`: AI interaction count
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

### Chat Collections

#### `chatRooms`
Chat rooms

**Fields:**
- `name`: Room name
- `description`: Room description
- `type`: Room type (public, announcement)
- `createdBy`: Creator user ID
- `archived`: Archive status
- `createdAt`: Creation timestamp

#### `chatRooms/{roomId}/messages`
Chat messages

**Fields:**
- `senderId`: Sender user ID
- `authorName`: Sender display name
- `text`: Message text
- `type`: Message type
- `createdAt`: Creation timestamp

#### `chat_channels`
Chat channels

**Fields:**
- `name`: Channel name
- `description`: Channel description
- `creatorId`: Creator user ID
- `members`: Array of member user IDs
- `createdAt`: Creation timestamp

#### `chat_channels/{channelId}/messages`
Channel messages

**Fields:**
- `authorId`: Author user ID
- `authorName`: Author display name
- `text`: Message text
- `createdAt`: Creation timestamp
- `type`: Message type

---

### Knowledge Collections

#### `knowledge_articles`
Knowledge articles

**Fields:**
- `title`: Article title
- `content`: Article content
- `authorId`: Author user ID
- `authorName`: Author display name
- `category`: Article category
- `tags`: Array of tags
- `status`: Article status (DRAFT, PUBLISHED)
- `views`: View count
- `likes`: Array of liker user IDs
- `featured`: Featured status
- `indexed`: Search indexed status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### `knowledge_collections`
Smart collections

**Fields:**
- `name`: Collection name
- `description`: Collection description
- `creatorId`: Creator user ID
- `articleIds`: Array of article IDs
- `createdAt`: Creation timestamp

#### `knowledge_requests`
Knowledge requests (Q&A)

**Fields:**
- `title`: Request title
- `question`: Question content
- `authorId`: Author user ID
- `authorName`: Author display name
- `status`: Request status (OPEN, ANSWERED, CLOSED)
- `answers`: Array of answers
- `createdAt`: Creation timestamp

---

### Task Collections

#### `tasks`
Task records

**Fields:**
- `title`: Task title
- `description`: Task description
- `assigneeId`: Assignee user ID
- `creatorId`: Creator user ID
- `status`: Task status (ASSIGNED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, COMPLETED)
- `progress`: Progress percentage
- `xpReward`: XP reward
- `dueDate`: Due date
- `proof`: Proof submission data
- `reviewedBy`: Reviewer user ID
- `reviewNotes`: Review notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

## Key Patterns & Utilities

### Common Patterns

#### 1. `docsFrom(snap)`
Maps Firestore snapshot to array of objects with ID
```javascript
function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}
```

#### 2. `serverTimestamp()`
Firebase server timestamp for consistent timekeeping
```javascript
import { serverTimestamp } from 'firebase/firestore';
```

#### 3. Transactional Updates
Atomic updates for critical operations (XP, stats)
```javascript
await runTransaction(db, async (transaction) => {
  // Atomic operations
});
```

#### 4. Array Operations
```javascript
arrayUnion(uid)    // Add to array
arrayRemove(uid)   // Remove from array
increment(1)       // Increment field
```

#### 5. Field Validation
Strict field validation on creates and updates
```javascript
request.resource.data.keys().hasOnly(['allowed', 'fields'])
request.resource.data.diff(resource.data).affectedKeys().hasOnly(['allowed', 'fields'])
```

#### 6. Normalization Functions
Clean and normalize input data
```javascript
function clean(value) {
  return String(value || '').trim();
}

function normalizeText(value) {
  return clean(value).toLowerCase();
}
```

#### 7. Search Indexing
Create searchable strings from entities
```javascript
function searchable(item) {
  return [item.title, item.description, item.category].join(' ').toLowerCase();
}
```

#### 8. XP Calculation
Level calculation based on XP
```javascript
function calculateLevel(xp) {
  // Level calculation logic
}
```

#### 9. Code Generation
Unique code generation for certificates
```javascript
function generateVerificationCode() {
  // Generate unique verification code
}

function generateCertNumber() {
  // Generate unique certificate number
}
```

#### 10. Activity Logging
Audit trail for organizational changes
```javascript
function logOrgChange(action, actorId, targetId, targetType, changes) {
  // Log organizational change
}
```

---

### Utility Functions

#### `normalizeText(value)`
Clean and normalize text values

#### `searchable(item)`
Create searchable string from item fields

#### `sortItems(items, sort)`
Sort items by various criteria

#### `chunkArray(array, size)`
Chunk array for batch operations

#### `debounce(func, wait)`
Debounce function calls

#### `throttle(func, wait)`
Throttle function calls

---

## Recommendations & Observations

### Strengths

1. **Comprehensive Feature Set:** Platform covers a wide range of features from research to marketplace to governance
2. **Strong Security Model:** Role-based access control with field-level validation
3. **Gamification Integration:** Well-integrated XP, achievements, and certificate systems
4. **Real-time Capabilities:** Firebase Realtime Database for presence and live updates
5. **Modular Architecture:** Clean separation of concerns with service-based architecture
6. **Lazy Loading:** All routes lazy-loaded for performance
7. **Accessibility:** Minimum 44px touch targets, focus management, ARIA labels
8. **Mobile Responsive:** Mobile-first design with dedicated mobile components

### Areas for Improvement

1. **Firestore Rules Complexity:** Rules are very complex and could benefit from simplification or better organization
2. **Duplicate Rules:** Some storage rules are duplicated (teams, products, creative, funflix, marketplace)
3. **Error Handling:** Could benefit from more comprehensive error handling and user feedback
4. **Testing:** No visible test infrastructure - consider adding unit and integration tests
5. **Documentation:** Service files could benefit from JSDoc comments
6. **Type Safety:** Consider migrating to TypeScript for better type safety
7. **Performance:** Large number of routes could impact bundle size - consider code splitting strategies
8. **State Management:** Consider consolidating stores or using a more structured state management solution

### Security Observations

1. **Strong Field Validation:** Excellent field validation on creates and updates
2. **Ownership Verification:** Good ownership verification for content modifications
3. **Public Read Strategy:** Most content is publicly readable, which is appropriate for a showcase platform
4. **Admin Override:** CEOs have broad override capabilities - ensure proper CEO vetting
5. **XP Protection:** XP and stats updates are protected with transactional updates
6. **Storage Security:** Storage rules properly verify Firestore data for ownership

### Architecture Observations

1. **Service Layer Pattern:** Clean service layer abstraction for Firebase operations
2. **Component Reusability:** Good component reusability with variants and sub-components
3. **Route Organization:** Routes are well-organized with clear grouping
4. **Lazy Loading:** All routes lazy-loaded for performance
5. **Real-time Integration:** Good integration of real-time features (presence, chat)

### Data Model Observations

1. **Consistent Timestamps:** Consistent use of serverTimestamp()
2. **Normalization:** Good data normalization patterns
3. **Indexing:** Search indexing for knowledge base
4. **Audit Trail:** Comprehensive audit logging for governance
5. **Versioning:** Document versioning for workspace

---

## Conclusion

BeastBuck is a sophisticated, feature-rich platform with a well-architected service layer, comprehensive security model, and extensive feature set. The platform successfully integrates multiple complex systems including gamification, research management, marketplace functionality, organizational governance, and real-time collaboration.

The codebase demonstrates strong engineering practices with modular architecture, lazy loading, accessibility considerations, and security-first design. The Firebase integration is well-implemented with proper security rules and transactional updates for critical operations.

The platform is production-ready with considerations for scalability, security, and user experience. Continued focus on testing, documentation, and performance optimization would further enhance the codebase quality.

---

**Report End**
