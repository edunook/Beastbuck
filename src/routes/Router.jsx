import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { hasPermission, PERMISSIONS } from '../services/firebase/permissions';
import AppShell from '../components/layout/AppShell';
import NotFound from '../components/NotFound';

// --- Lazy Loaded Routes ---
const PublicLayout = React.lazy(() => import('../features/public/PublicLayout'));
const PublicHome = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicHome })));
const PublicAbout = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicAbout })));
const PublicExperiments = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicExperiments })));
const PublicMarketplace = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicMarketplace })));
const PublicProjects = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicProjects })));
const HallOfFame = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.HallOfFame })));
const JoinPage = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.JoinPage })));
const PublicMemberProfile = React.lazy(() => import('../features/public/PublicPages').then(module => ({ default: module.PublicMemberProfile })));
const PublicUserPage = React.lazy(() => import('../features/community/CommunityPages').then(module => ({ default: module.PublicUserPage })));
const MembershipApply = React.lazy(() => import('../features/membership/MembershipApply'));
const AdminMemberships = React.lazy(() => import('../features/admin/AdminMemberships'));
const Dashboard = React.lazy(() => import('../features/dashboard/Dashboard'));
const CEOPanel = React.lazy(() => import('../features/dashboard/CEOPanel'));
const TasksHub = React.lazy(() => import('../features/tasks/TasksHub'));
const ChatPage = React.lazy(() => import('../features/chat/ChatPage'));
const CommunitiesPage = React.lazy(() => import('../features/community/CommunityPages').then(module => ({ default: module.CommunitiesPage })));
const CommunityDetailPage = React.lazy(() => import('../features/community/CommunityPages').then(module => ({ default: module.CommunityDetailPage })));
const ShowcasePage = React.lazy(() => import('../features/community/CommunityPages').then(module => ({ default: module.ShowcasePage })));
const DiscoverPage = React.lazy(() => import('../features/community/CommunityPages').then(module => ({ default: module.DiscoverPage })));
const ProfilePage = React.lazy(() => import('../features/profile/ProfilePage'));
const LeaderboardsPage = React.lazy(() => import('../features/leaderboards/LeaderboardsPage'));
const ExperimentsLab = React.lazy(() => import('../features/experiments/ExperimentsLab'));
const ExperimentDetail = React.lazy(() => import('../features/experiments/ExperimentDetail'));
const ProductsMarketplace = React.lazy(() => import('../features/products/ProductsMarketplace'));
const ProductDetail = React.lazy(() => import('../features/products/ProductDetail'));
const OrganizationHub = React.lazy(() => import('../features/organization/OrganizationHub'));
const DivisionDashboard = React.lazy(() => import('../features/organization/DivisionDashboard'));
const DepartmentDashboard = React.lazy(() => import('../features/organization/DepartmentDashboard'));
const LabDashboard = React.lazy(() => import('../features/organization/LabDashboard'));
const TeamDashboard = React.lazy(() => import('../features/organization/TeamDashboard'));
const OperationsCenter = React.lazy(() => import('../features/organization/OperationsCenter'));
const AdminOrganization = React.lazy(() => import('../features/admin/AdminOrganization'));
const SkillsHub = React.lazy(() => import('../features/skills/SkillsHub'));
const SkillDetail = React.lazy(() => import('../features/skills/SkillDetail'));
const AIOS = React.lazy(() => import('../features/ai/AIOS'));
const AccessDenied = React.lazy(() => import('../features/auth/AccessDenied'));
const SignIn = React.lazy(() => import('../features/auth/SignIn'));
const SignUp = React.lazy(() => import('../features/auth/SignUp'));
const WorkspaceDashboard = React.lazy(() => import('../features/digital-workspace/WorkspaceDashboard'));
const WorkspaceDetail = React.lazy(() => import('../features/digital-workspace/WorkspaceDetail'));
const ModulePage = React.lazy(() => import('../features/dashboard/ModulePage'));
// --- Collaboration Routes (Step 29) ---
const VoiceRoomsPage = React.lazy(() => import('../features/collaboration/VoiceRoomsPage'));
const VideoMeetPage = React.lazy(() => import('../features/collaboration/VideoMeetPage'));
const WarRoomsPage = React.lazy(() => import('../features/collaboration/WarRoomsPage'));
const WarRoomDetail = React.lazy(() => import('../features/collaboration/WarRoomPage')); // Details
const BrainstormSession = React.lazy(() => import('../features/collaboration/BrainstormSession'));
const MeetingsPage = React.lazy(() => import('../features/collaboration/MeetingsPage'));
const ActivityStreamPage = React.lazy(() => import('../features/collaboration/ActivityStreamPage'));
const CollaborationHub = React.lazy(() => import('../features/collaboration/CollaborationHub'));
const AdminCollaboration = React.lazy(() => import('../features/admin/AdminCollaboration'));
const NotificationsCenter = React.lazy(() => import('../features/notifications/NotificationsCenter'));
// --- Admin Routes (Lazy Loaded) ---
const AdminLayout = React.lazy(() => import('../features/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('../features/admin/AdminDashboard'));
const AdminMembers = React.lazy(() => import('../features/admin/AdminMembers'));
const AdminRoles = React.lazy(() => import('../features/admin/AdminRoles'));
const AdminContent = React.lazy(() => import('../features/admin/AdminContent'));
const AdminGamification = React.lazy(() => import('../features/admin/AdminGamification'));
const AdminAuditLogs = React.lazy(() => import('../features/admin/AdminAuditLogs'));
const AdminAnalytics = React.lazy(() => import('../features/admin/AdminAnalytics'));
const AdminSecurity = React.lazy(() => import('../features/admin/AdminSecurity'));
const AdminEvents = React.lazy(() => import('../features/admin/AdminEvents'));
const AdminInnovation = React.lazy(() => import('../features/admin/AdminInnovation'));
const AdminVentures = React.lazy(() => import('../features/admin/AdminVentures'));
const AdminMarketplace = React.lazy(() => import('../features/admin/AdminMarketplace'));
const AdminAutomation = React.lazy(() => import('../features/admin/AdminAutomation'));
const AIMarketplaceAssistant = React.lazy(() => import('../features/marketplace/AIMarketplaceAssistant'));
const CreatorsHub = React.lazy(() => import('../features/marketplace/CreatorsHub'));
const ServicesMarketplace = React.lazy(() => import('../features/marketplace/ServicesMarketplace'));

// --- Governance & Trust OS (Step 34) ---
const GovernanceCenter = React.lazy(() => import('../features/governance/GovernanceCenter'));
const ElectionsHub = React.lazy(() => import('../features/governance/ElectionsHub'));
const VerificationCenter = React.lazy(() => import('../features/governance/VerificationCenter'));
const EndorsementsHub = React.lazy(() => import('../features/governance/EndorsementsHub'));
const ConflictResolution = React.lazy(() => import('../features/governance/ConflictResolution'));
const AIGovernanceAssistant = React.lazy(() => import('../features/governance/AIGovernanceAssistant'));
const AdminGovernance = React.lazy(() => import('../features/admin/AdminGovernance'));

// --- Intelligence & Predictive AI OS (Step 35) ---
const IntelligenceCenter = React.lazy(() => import('../features/intelligence/IntelligenceCenter'));
const EcosystemHealth = React.lazy(() => import('../features/intelligence/EcosystemHealth'));
const OpportunityScanner = React.lazy(() => import('../features/intelligence/OpportunityScanner'));
const RiskCenter = React.lazy(() => import('../features/intelligence/RiskCenter'));
const TrendAnalytics = React.lazy(() => import('../features/intelligence/TrendAnalytics'));
const ReportsAutomation = React.lazy(() => import('../features/intelligence/ReportsAutomation'));
const IntelligenceAlerts = React.lazy(() => import('../features/intelligence/IntelligenceAlerts'));
const AIExecutiveAdvisor = React.lazy(() => import('../features/intelligence/AIExecutiveAdvisor'));
const AdminIntelligence = React.lazy(() => import('../features/admin/AdminIntelligence'));

// --- Ecosystem Expansion & Legacy OS (Step 36) ---
const EcosystemHub = React.lazy(() => import('../features/ecosystem/EcosystemHub'));
const ChaptersHub = React.lazy(() => import('../features/ecosystem/ChaptersHub'));
const AmbassadorHub = React.lazy(() => import('../features/ecosystem/AmbassadorHub'));
const InstitutionHub = React.lazy(() => import('../features/ecosystem/InstitutionHub'));
const ProgramsHub = React.lazy(() => import('../features/ecosystem/ProgramsHub'));
const LegacyCenter = React.lazy(() => import('../features/legacy/LegacyCenter'));
const LegacyHallOfFame = React.lazy(() => import('../features/legacy/HallOfFame'));
const GlobalRankings = React.lazy(() => import('../features/legacy/GlobalRankings'));
const AILegacyAdvisor = React.lazy(() => import('../features/legacy/AILegacyAdvisor'));
const AdminEcosystem = React.lazy(() => import('../features/admin/AdminEcosystem'));

// --- Mission Control Routes (Lazy Loaded) ---
const MissionControlLayout = React.lazy(() => import('../features/mission-control/MissionControlLayout'));
const MissionControlDashboard = React.lazy(() => import('../features/mission-control/MissionControlDashboard'));
const ExecutiveAlerts = React.lazy(() => import('../features/mission-control/ExecutiveAlerts'));
const ProjectHealth = React.lazy(() => import('../features/mission-control/ProjectHealth'));
const OrganizationHealth = React.lazy(() => import('../features/mission-control/OrganizationHealth'));
const MemberAnalytics = React.lazy(() => import('../features/mission-control/MemberAnalytics'));
const GlobalSearch = React.lazy(() => import('../features/mission-control/GlobalSearch'));
const ReportsCenter = React.lazy(() => import('../features/mission-control/ReportsCenter'));
const AIInsights = React.lazy(() => import('../features/mission-control/AIInsights'));
const InnovationHealth = React.lazy(() => import('../features/mission-control/InnovationHealth'));

// --- Events & Challenges (Step 16) ---
const EventsPage = React.lazy(() => import('../features/events/EventsPage'));
const EventDetail = React.lazy(() => import('../features/events/EventDetail'));
const ChallengeDetail = React.lazy(() => import('../features/events/ChallengeDetail'));

// --- Portfolios & Certificates (Step 17) ---
const PortfolioShowcase = React.lazy(() => import('../features/portfolio/PortfolioShowcase'));
const PortfolioPage = React.lazy(() => import('../features/portfolio/PortfolioPage'));
const PortfolioShare = React.lazy(() => import('../features/portfolio/PortfolioShare'));
const CertificateView = React.lazy(() => import('../features/portfolio/CertificateView'));

// --- Innovation Registry (Step 18) ---
const InnovationShowcase = React.lazy(() => import('../features/innovation/InnovationShowcase'));
const VenturesHub = React.lazy(() => import('../features/ventures/VenturesHub'));
const VentureDetail = React.lazy(() => import('../features/ventures/VentureDetail'));
const VentureDirectory = React.lazy(() => import('../features/ventures/VentureDirectory'));
const VentureBuilder = React.lazy(() => import('../features/ventures/VentureBuilder'));
const IncubatorHub = React.lazy(() => import('../features/ventures/IncubatorHub'));
const AIVentureAssistant = React.lazy(() => import('../features/ai/AIVentureAssistant'));
const VentureHealth = React.lazy(() => import('../features/mission-control/VentureHealth'));
const MarketplaceHome = React.lazy(() => import('../features/marketplace/MarketplaceHome'));
const MarketplaceDetail = React.lazy(() => import('../features/marketplace/MarketplaceDetail'));
const CreatorProfile = React.lazy(() => import('../features/marketplace/CreatorProfile'));
const MarketplaceHealth = React.lazy(() => import('../features/mission-control/MarketplaceHealth'));
const CollaborationHealth = React.lazy(() => import('../features/mission-control/CollaborationHealth'));

// --- Developer & Integration OS (Step 38) ---
const DeveloperPortal = React.lazy(() => import('../features/developer/DeveloperPortal'));
const APIKeysCenter = React.lazy(() => import('../features/developer/APIKeysCenter'));
const WebhookCenter = React.lazy(() => import('../features/developer/WebhookCenter'));
const SDKCenter = React.lazy(() => import('../features/developer/SDKCenter'));
const DeveloperMarketplace = React.lazy(() => import('../features/developer/DeveloperMarketplace'));
const AIProviderCenter = React.lazy(() => import('../features/integrations/AIProviderCenter'));
const ProductivityIntegrations = React.lazy(() => import('../features/integrations/ProductivityIntegrations'));
const ResearchIntegrations = React.lazy(() => import('../features/integrations/ResearchIntegrations'));
const LearningIntegrations = React.lazy(() => import('../features/integrations/LearningIntegrations'));
const CommunicationHub = React.lazy(() => import('../features/integrations/CommunicationHub'));
const EnterpriseIntegrations = React.lazy(() => import('../features/integrations/EnterpriseIntegrations'));
const IntegrationSecurityCenter = React.lazy(() => import('../features/integrations/IntegrationSecurityCenter'));
const IntegrationAnalytics = React.lazy(() => import('../features/integrations/IntegrationAnalytics'));

// --- Global Ecosystem & Legacy (Step 39) ---
const CommunityNetwork = React.lazy(() => import('../features/global-ecosystem/CommunityNetwork'));
const OrganizationNetwork = React.lazy(() => import('../features/global-ecosystem/OrganizationNetwork'));
const GlobalEventsHub = React.lazy(() => import('../features/global-ecosystem/GlobalEventsHub'));
const GlobalIntelligence = React.lazy(() => import('../features/global-ecosystem/GlobalIntelligence'));
const GlobalAnalytics = React.lazy(() => import('../features/global-ecosystem/GlobalAnalytics'));
const GlobalSearchCenter = React.lazy(() => import('../features/global-ecosystem/GlobalSearchCenter'));
const ComplianceCenter = React.lazy(() => import('../features/global-ecosystem/ComplianceCenter'));
const GlobalMissionControl = React.lazy(() => import('../features/global-ecosystem/GlobalMissionControl'));
const AdminGlobalEcosystem = React.lazy(() => import('../features/global-ecosystem/AdminGlobalEcosystem'));

const RecognitionCenter = React.lazy(() => import('../features/legacy/RecognitionCenter'));
const TimelineCenter = React.lazy(() => import('../features/legacy/TimelineCenter'));

// --- Platform Hardening & Launch (Step 40) ---
const SecurityCenter = React.lazy(() => import('../features/platform/SecurityCenter'));
const SEOHealthCenter = React.lazy(() => import('../features/platform/SEOHealthCenter'));
const MonitoringCenter = React.lazy(() => import('../features/platform/MonitoringCenter'));
const BackupCenter = React.lazy(() => import('../features/platform/BackupCenter'));
const DocumentationCenter = React.lazy(() => import('../features/platform/DocumentationCenter'));
const LaunchCenter = React.lazy(() => import('../features/platform/LaunchCenter'));
const PlatformCertificationCenter = React.lazy(() => import('../features/platform/PlatformCertificationCenter'));
const ReleaseManager = React.lazy(() => import('../features/platform/ReleaseManager'));

// --- FunFlix OS (Step 41) ---
const FunFlixHub = React.lazy(() => import('../features/funflix/FunFlixHub'));
const MoviePlayer = React.lazy(() => import('../features/funflix/MoviePlayer'));
const CreatorStudio = React.lazy(() => import('../features/funflix/CreatorStudio'));
const MyMovies = React.lazy(() => import('../features/funflix/MyMovies'));
const FunFlixCreatorProfile = React.lazy(() => import('../features/funflix/CreatorProfile'));
const MovieUploadWizard = React.lazy(() => import('../features/funflix/MovieUploadWizard'));
const MovieAnalytics = React.lazy(() => import('../features/funflix/MovieAnalytics'));
const MoviePlaylists = React.lazy(() => import('../features/funflix/MoviePlaylists'));
const AIFunFlixAssistant = React.lazy(() => import('../features/funflix/AIFunFlixAssistant'));
const FunFlixChallenges = React.lazy(() => import('../features/funflix/FunFlixChallenges'));
const FunFlixAnalytics = React.lazy(() => import('../features/mission-control/FunFlixAnalytics'));
const AdminFunFlix = React.lazy(() => import('../features/admin/AdminFunFlix'));

// --- AI Creator Studio & Marketplace (Step 42) ---
const AICreatorStudio = React.lazy(() => import('../features/ai-creator/AICreatorStudio'));
const CreateAIWizard = React.lazy(() => import('../features/ai-creator/CreateAIWizard'));
const AIProfilePage = React.lazy(() => import('../features/ai-creator/AIProfilePage'));
const AIChatPage = React.lazy(() => import('../features/ai-creator/AIChatPage'));
const AIMarketplaceBrowser = React.lazy(() => import('../features/ai-creator/AIMarketplaceBrowser'));
const AICreatorAnalytics = React.lazy(() => import('../features/ai-creator/AICreatorAnalytics'));
const AICollections = React.lazy(() => import('../features/ai-creator/AICollections'));
const AITrainingCenter = React.lazy(() => import('../features/ai-creator/AITrainingCenter'));
const AIEcosystemAnalytics = React.lazy(() => import('../features/mission-control/AIEcosystemAnalytics'));
const AdminAIStudio = React.lazy(() => import('../features/admin/AdminAIStudio'));

// Mobile/Desktop mock views
const MobileDashboard = React.lazy(() => import('../mobile/MobileDashboard'));
const DesktopHub = React.lazy(() => import('../desktop/DesktopHub'));

// --- Agentic Workforce OS (Step 37) ---
const AgentOS = React.lazy(() => import('../features/agents/AgentOS'));
const AgentBuilder = React.lazy(() => import('../features/agents/AgentBuilder'));
const AutomationCenter = React.lazy(() => import('../features/agents/AutomationCenter'));
const AgentMarketplace = React.lazy(() => import('../features/agents/AgentMarketplace'));
const AIOperationsCenter = React.lazy(() => import('../features/agents/AIOperationsCenter'));
const ApprovalCenter = React.lazy(() => import('../features/agents/ApprovalCenter'));
const AutomationAnalytics = React.lazy(() => import('../features/agents/AutomationAnalytics'));
const ResearchAutomation = React.lazy(() => import('../features/agents/ResearchAutomation'));
const VentureAutomation = React.lazy(() => import('../features/agents/VentureAutomation'));
const MarketplaceAutomation = React.lazy(() => import('../features/agents/MarketplaceAutomation'));
const KnowledgeAutomation = React.lazy(() => import('../features/agents/KnowledgeAutomation'));
const CollaborationAutomation = React.lazy(() => import('../features/agents/CollaborationAutomation'));
const GovernanceAutomation = React.lazy(() => import('../features/agents/GovernanceAutomation'));
const AutomationHealth = React.lazy(() => import('../features/mission-control/AutomationHealth'));

// --- Universe OS (Step 28) ---
const UniverseHome = React.lazy(() => import('../features/universe/UniverseHome'));
const UnifiedSearchPage = React.lazy(() => import('../features/universe/UnifiedSearchPage'));
const UniverseGoals = React.lazy(() => import('../features/universe/UniverseGoals'));
const KnowledgeGraphView = React.lazy(() => import('../features/universe/KnowledgeGraphView'));
const AdminUniverse = React.lazy(() => import('../features/admin/AdminUniverse'));
const UniverseAnalytics = React.lazy(() => import('../features/mission-control/UniverseAnalytics'));

// --- Knowledge Base (Step 19 & 30) ---
const KnowledgeHub = React.lazy(() => import('../features/knowledge/KnowledgeHub'));
const ArticleViewer = React.lazy(() => import('../features/knowledge/ArticleViewer'));
const KnowledgeMap = React.lazy(() => import('../features/knowledge/KnowledgeMap'));
const SmartCollections = React.lazy(() => import('../features/knowledge/SmartCollections'));
const LearningPaths = React.lazy(() => import('../features/knowledge/LearningPaths'));
const KnowledgeRequests = React.lazy(() => import('../features/knowledge/KnowledgeRequests'));
const ExpertDirectory = React.lazy(() => import('../features/experts/ExpertDirectory'));
const MentorshipHub = React.lazy(() => import('../features/experts/MentorshipHub'));
const KnowledgeAnalytics = React.lazy(() => import('../features/mission-control/KnowledgeAnalytics'));
const AdminKnowledge = React.lazy(() => import('../features/admin/AdminKnowledge'));

// --- Generic Fullscreen Loader ---
export const FullScreenLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center w-full">
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
  </div>
);

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children, requireMember, requireCeo, requireAdmin, requireAuth = true }) => {
  const { user, roleData, isAuthInitialized } = useAuth();

  if (!isAuthInitialized) return <FullScreenLoader />;

  // Always require authentication by default
  if (requireAuth && !user) {
    return <Navigate to="/signin" replace />;
  }

  const role = roleData?.role;

  // Check membership status if requireMember is true
  if (requireMember && !PERMISSIONS.isApprovedMember(role)) {
    return <Navigate to="/membership/apply" replace />;
  }

  if (requireCeo && !hasPermission(role, 'canAccessCeoPanel')) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requireAdmin && !hasPermission(role, 'canAccessAdmin')) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return children;
};

// --- Auth Route Wrapper (prevent logged-in users from seeing signin) ---
const AuthRoute = ({ children }) => {
  const { user, isAuthInitialized } = useAuth();
  
  if (!isAuthInitialized) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

export default function AppRouter() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Auth Routes - Only accessible when not signed in */}
        <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        
        {/* All other routes require authentication */}
        <Route element={<ProtectedRoute><PublicLayout /></ProtectedRoute>}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/about" element={<PublicAbout />} />
          <Route path="/experiments" element={<PublicExperiments />} />
          <Route path="/public-marketplace" element={<PublicMarketplace />} />
          <Route path="/projects" element={<PublicProjects />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/members/:uid" element={<PublicMemberProfile />} />
          <Route path="/u/:username" element={<PublicUserPage />} />
        </Route>
        <Route path="/access-denied" element={<AccessDenied />} />
        
        {/* Membership Routes - Public for authenticated users */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/membership/apply" element={<MembershipApply />} />
        </Route>
        
        {/* AppShell Protected Routes - Public for authenticated users */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/universe" element={<UniverseHome />} />
          <Route path="/universe/goals" element={<UniverseGoals />} />
          <Route path="/universe/graph" element={<KnowledgeGraphView />} />
          <Route path="/search" element={<UnifiedSearchPage />} />
          
          {/* Standalone pages outside the main layout */}
          <Route path="/auth/login" element={<SignIn />} />
          <Route path="/auth/register" element={<SignUp />} />
          
          {/* Mobile / Desktop apps */}
          <Route path="/mobile" element={<MobileDashboard />} />
          <Route path="/desktop" element={<DesktopHub />} />

          <Route path="/tasks" element={<TasksHub />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:communityId" element={<CommunityDetailPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/workspace" element={<WorkspaceDashboard />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/workspace/experiments" element={<ProtectedRoute requireMember><ExperimentsLab /></ProtectedRoute>} />
          <Route path="/workspace/experiments/:experimentId" element={<ExperimentDetail />} />
          <Route path="/workspace/products" element={<ProtectedRoute requireMember><ProductsMarketplace /></ProtectedRoute>} />
          <Route path="/workspace/products/:productId" element={<ProductDetail />} />
          
          {/* ========================================
              COLLABORATION OS ROUTES (Step 29)
              ======================================== */}
          <Route path="/voice" element={<VoiceRoomsPage />} />
          <Route path="/meet" element={<VideoMeetPage />} />
          <Route path="/meet/:roomId" element={<VideoMeetPage />} />
          <Route path="/war-rooms" element={<WarRoomsPage />} />
          <Route path="/war-rooms/:id" element={<WarRoomDetail />} />
          <Route path="/brainstorm/:id" element={<BrainstormSession />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/activity" element={<ActivityStreamPage />} />
          <Route path="/collaboration" element={<CollaborationHub />} />
          <Route path="/war-room/:id" element={<WarRoomDetail />} />

          {/* ========================================
              ORGANIZATION OS ROUTES (Step 20) - Member Only
              ======================================== */}
          <Route path="/organization" element={<OrganizationHub />} />
          <Route path="/organization/division/:id" element={<DivisionDashboard />} />
          <Route path="/organization/department/:id" element={<DepartmentDashboard />} />
          <Route path="/organization/lab/:id" element={<LabDashboard />} />
          <Route path="/organization/team/:id" element={<TeamDashboard />} />
          <Route path="/operations" element={<OperationsCenter />} />
          
          <Route path="/creative" element={<ModulePage type="creative" />} />
          <Route path="/workspace/skills" element={<SkillsHub />} />
          <Route path="/workspace/skills/:skillId" element={<SkillDetail />} />
          <Route path="/teams" element={<Navigate to="/organization" replace />} />
          <Route path="/announcements" element={<ModulePage type="announcements" />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/notifications" element={<NotificationsCenter />} />
          <Route path="/analytics" element={<ModulePage type="analytics" />} />
          <Route path="/assessment" element={<ModulePage type="assessment" />} />
          <Route path="/ai" element={<AIOS />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:uid" element={<ProfilePage />} />
          <Route path="/settings" element={<ModulePage type="settings" />} />
          
          {/* CEO Protected Routes inside AppShell */}
          <Route 
            path="/ceo-panel" 
            element={
              <ProtectedRoute requireCeo>
                <CEOPanel />
              </ProtectedRoute>
            } 
          />

          {/* ========================================
              EVENTS & CHALLENGES ROUTES (Step 16)
              ======================================== */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetail />} />
          <Route path="challenges/:challengeId" element={<ChallengeDetail />} />

          {/* ========================================
              PORTFOLIOS & CERTIFICATES ROUTES (Step 17)
              ======================================== */}
          <Route path="portfolios" element={<PortfolioShowcase />} />
          <Route path="portfolio/:username" element={<PortfolioPage />} />
          <Route path="portfolio/:username/share" element={<PortfolioShare />} />
          <Route path="verify/:certId" element={<CertificateView />} />

          {/* ========================================
              INNOVATION REGISTRY ROUTES (Step 18)
              ======================================== */}
          <Route path="innovation/explore" element={<InnovationShowcase />} />
          <Route path="innovation/create" element={<InnovationShowcase />} />
          <Route path="ventures" element={<VenturesHub />} />
          <Route path="ventures/explore" element={<VentureDirectory />} />
          <Route path="ventures/:id" element={<VentureDetail />} />
          <Route path="venture-builder" element={<ProtectedRoute requireMember><VentureBuilder /></ProtectedRoute>} />
          <Route path="incubator" element={<IncubatorHub />} />
          <Route path="ai-venture" element={<AIVentureAssistant />} />
          <Route path="marketplace" element={<MarketplaceHome />} />
          <Route path="marketplace/item/:id" element={<MarketplaceDetail />} />
          <Route path="marketplace/create" element={<MarketplaceHome />} />
          <Route path="marketplace/ai-assistant" element={<AIMarketplaceAssistant />} />
          <Route path="creators" element={<CreatorsHub />} />
          <Route path="creator/:username" element={<CreatorProfile />} />
          <Route path="services" element={<ServicesMarketplace />} />
          {/* ========================================
              AGENTIC WORKFORCE & AUTOMATION (Step 37)
              ======================================== */}
          <Route path="automation" element={<AgentOS />} />
          <Route path="automation/builder" element={<ProtectedRoute requireMember><AgentBuilder /></ProtectedRoute>} />
          <Route path="automation/center" element={<AutomationCenter />} />
          <Route path="automation/marketplace" element={<AgentMarketplace />} />
          <Route path="automation/operations" element={<AIOperationsCenter />} />
          <Route path="automation/approvals" element={<ApprovalCenter />} />
          <Route path="automation/analytics" element={<AutomationAnalytics />} />
          <Route path="automation/research" element={<ResearchAutomation />} />
          <Route path="automation/venture" element={<VentureAutomation />} />
          <Route path="automation/marketplace-auto" element={<MarketplaceAutomation />} />
          <Route path="automation/knowledge" element={<KnowledgeAutomation />} />
          <Route path="automation/collaboration" element={<CollaborationAutomation />} />
          <Route path="automation/governance" element={<GovernanceAutomation />} />

          {/* ========================================
              DEVELOPER & INTEGRATION OS (Step 38)
              ======================================== */}
          <Route path="developer" element={<DeveloperPortal />} />
          <Route path="developer/keys" element={<APIKeysCenter />} />
          <Route path="developer/webhooks" element={<WebhookCenter />} />
          <Route path="developer/sdks" element={<SDKCenter />} />
          <Route path="developer/marketplace" element={<DeveloperMarketplace />} />
          
          <Route path="integrations/ai-providers" element={<AIProviderCenter />} />
          <Route path="integrations/productivity" element={<ProductivityIntegrations />} />
          <Route path="integrations/research" element={<ResearchIntegrations />} />
          <Route path="integrations/learning" element={<LearningIntegrations />} />
          <Route path="integrations/communication" element={<CommunicationHub />} />
          <Route path="integrations/enterprise" element={<EnterpriseIntegrations />} />
          <Route path="integrations/security" element={<IntegrationSecurityCenter />} />
          <Route path="integrations/analytics" element={<IntegrationAnalytics />} />

          {/* ========================================
              GLOBAL ECOSYSTEM & LEGACY (Step 39)
              ======================================== */}
          <Route path="global/communities" element={<CommunityNetwork />} />
          <Route path="global/organizations" element={<OrganizationNetwork />} />
          <Route path="global/events" element={<GlobalEventsHub />} />
          <Route path="global/intelligence" element={<GlobalIntelligence />} />
          <Route path="global/analytics" element={<GlobalAnalytics />} />
          <Route path="global/search" element={<GlobalSearchCenter />} />
          <Route path="global/compliance" element={<ComplianceCenter />} />
          <Route path="mission-control/global" element={<GlobalMissionControl />} />
          <Route path="admin/global" element={<AdminGlobalEcosystem />} />

          <Route path="legacy/hall-of-fame" element={<LegacyCenter />} />
          <Route path="legacy/recognition" element={<RecognitionCenter />} />
          <Route path="legacy/timeline" element={<TimelineCenter />} />

          {/* ========================================
              PLATFORM HARDENING & LAUNCH (Step 40)
              ======================================== */}
          <Route path="platform/security" element={<SecurityCenter />} />
          <Route path="platform/seo" element={<SEOHealthCenter />} />
          <Route path="platform/monitoring" element={<MonitoringCenter />} />
          <Route path="platform/backup" element={<BackupCenter />} />
          <Route path="platform/docs" element={<DocumentationCenter />} />
          <Route path="platform/launch" element={<LaunchCenter />} />
          <Route path="platform/certification" element={<PlatformCertificationCenter />} />
          <Route path="platform/releases" element={<ReleaseManager />} />

          {/* ========================================
              FUNFLIX OS (Step 41)
              ======================================== */}
          <Route path="funflix" element={<FunFlixHub />} />
          <Route path="funflix/watch/:movieId" element={<MoviePlayer />} />
          <Route path="funflix/studio" element={<ProtectedRoute requireMember><CreatorStudio /></ProtectedRoute>} />
          <Route path="funflix/my-movies" element={<ProtectedRoute requireMember><MyMovies /></ProtectedRoute>} />
          <Route path="funflix/creator/:username" element={<FunFlixCreatorProfile />} />
          <Route path="funflix/upload" element={<ProtectedRoute requireMember><MovieUploadWizard /></ProtectedRoute>} />
          <Route path="funflix/analytics" element={<ProtectedRoute requireMember><MovieAnalytics /></ProtectedRoute>} />
          <Route path="funflix/playlists" element={<ProtectedRoute requireMember><MoviePlaylists /></ProtectedRoute>} />
          <Route path="funflix/ai" element={<AIFunFlixAssistant />} />
          <Route path="funflix/challenges" element={<FunFlixChallenges />} />
          <Route path="mission-control/funflix" element={<FunFlixAnalytics />} />
          <Route path="admin/funflix" element={<AdminFunFlix />} />

          {/* ========================================
              AI CREATOR STUDIO & MARKETPLACE (Step 42)
              ======================================== */}
          <Route path="ai-studio" element={<AICreatorStudio />} />
          <Route path="ai-studio/create" element={<ProtectedRoute requireMember><CreateAIWizard /></ProtectedRoute>} />
          <Route path="ai-studio/analytics" element={<ProtectedRoute requireMember><AICreatorAnalytics /></ProtectedRoute>} />
          <Route path="ai-studio/training" element={<ProtectedRoute requireMember><AITrainingCenter /></ProtectedRoute>} />
          <Route path="ais" element={<AIMarketplaceBrowser />} />
          <Route path="ais/:aiId" element={<AIProfilePage />} />
          <Route path="ais/:aiId/chat" element={<AIChatPage />} />
          <Route path="ai-collections" element={<AICollections />} />
          <Route path="mission-control/ai-ecosystem" element={<AIEcosystemAnalytics />} />
          <Route path="admin/ai-studio" element={<AdminAIStudio />} />

          {/* ========================================
              GOVERNANCE & TRUST OS ROUTES (Step 34)
              ======================================== */}
          <Route path="governance" element={<GovernanceCenter />} />
          <Route path="governance/elections" element={<ElectionsHub />} />
          <Route path="governance/verification" element={<VerificationCenter />} />
          <Route path="governance/endorsements" element={<EndorsementsHub />} />
          <Route path="governance/conflict" element={<ConflictResolution />} />
          <Route path="governance/ai" element={<AIGovernanceAssistant />} />

          {/* ========================================
              INTELLIGENCE & PREDICTIVE AI OS ROUTES (Step 35)
              ======================================== */}
          <Route path="intelligence" element={<IntelligenceCenter />} />
          <Route path="intelligence/health" element={<EcosystemHealth />} />
          <Route path="intelligence/opportunities" element={<OpportunityScanner />} />
          <Route path="intelligence/risks" element={<RiskCenter />} />
          <Route path="intelligence/trends" element={<TrendAnalytics />} />
          <Route path="intelligence/reports" element={<ReportsAutomation />} />
          <Route path="intelligence/alerts" element={<IntelligenceAlerts />} />
          <Route path="intelligence/ai" element={<AIExecutiveAdvisor />} />

          {/* ========================================
              ECOSYSTEM & LEGACY OS ROUTES (Step 36)
              ======================================== */}
          <Route path="ecosystem" element={<EcosystemHub />} />
          <Route path="ecosystem/chapters" element={<ChaptersHub />} />
          <Route path="ecosystem/ambassadors" element={<AmbassadorHub />} />
          <Route path="ecosystem/institutions" element={<InstitutionHub />} />
          <Route path="ecosystem/programs" element={<ProgramsHub />} />
          <Route path="legacy" element={<LegacyCenter />} />
          <Route path="legacy/hall-of-fame" element={<LegacyHallOfFame />} />
          <Route path="legacy/rankings" element={<GlobalRankings />} />
          <Route path="legacy/ai" element={<AILegacyAdvisor />} />

          {/* ========================================
              KNOWLEDGE BASE ROUTES (Step 19)
              ======================================== */}
          <Route path="knowledge" element={<KnowledgeHub />} />
          <Route path="knowledge/article/:id" element={<ArticleViewer />} />
          <Route path="knowledge/maps" element={<KnowledgeMap />} />
          <Route path="knowledge/collections" element={<SmartCollections />} />
          <Route path="knowledge/paths" element={<LearningPaths />} />
          <Route path="knowledge/requests" element={<KnowledgeRequests />} />
          <Route path="experts" element={<ExpertDirectory />} />
          <Route path="mentorship" element={<MentorshipHub />} />

          {/* ========================================
              ADMIN COMMAND CENTER ROUTES
              ======================================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="memberships" element={<AdminMemberships />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="gamification" element={<AdminGamification />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="audit-logs/:logId" element={<AdminAuditLogs />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="innovation" element={<AdminInnovation />} />
            <Route path="ventures" element={<AdminVentures />} />
            <Route path="marketplace" element={<AdminMarketplace />} />
            <Route path="automation" element={<AdminAutomation />} />
            <Route path="universe" element={<AdminUniverse />} />
            <Route path="collaboration" element={<AdminCollaboration />} />
            <Route path="organization" element={<AdminOrganization />} />
            <Route path="knowledge" element={<AdminKnowledge />} />
            <Route path="ventures" element={<AdminVentures />} />
            <Route path="governance" element={<AdminGovernance />} />
            <Route path="intelligence" element={<AdminIntelligence />} />
            <Route path="ecosystem" element={<AdminEcosystem />} />
          </Route>

          {/* ========================================
              MISSION CONTROL ROUTES (Step 15)
              ======================================== */}
          <Route
            path="/mission-control"
            element={
              <ProtectedRoute requireCeo>
                <MissionControlLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<MissionControlDashboard />} />
            <Route path="alerts" element={<ExecutiveAlerts />} />
            <Route path="projects" element={<ProjectHealth />} />
            <Route path="org" element={<OrganizationHealth />} />
            <Route path="members" element={<MemberAnalytics />} />
            <Route path="search" element={<GlobalSearch />} />
            <Route path="reports" element={<ReportsCenter />} />
            <Route path="ai" element={<AIInsights />} />
            <Route path="innovation" element={<InnovationHealth />} />
            <Route path="ventures" element={<VentureHealth />} />
            <Route path="marketplace" element={<MarketplaceHealth />} />
            <Route path="automation" element={<AutomationHealth />} />
            <Route path="collaboration" element={<CollaborationHealth />} />
            <Route path="universe" element={<UniverseAnalytics />} />
            <Route path="knowledge" element={<KnowledgeAnalytics />} />
            <Route path="ventures" element={<VentureHealth />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
