import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import AppShell from '@frontend/components/layout/AppShell';
import NotFound from '@frontend/components/NotFound';

// --- Lazy Loaded Routes ---
const PublicLayout = React.lazy(() => import('@frontend/features/public/PublicLayout'));
const PublicHome = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicHome })));
const PublicAbout = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicAbout })));
const PublicExperiments = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicExperiments })));
const PublicMarketplace = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicMarketplace })));
const PublicProjects = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicProjects })));
const HallOfFame = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.HallOfFame })));
const JoinPage = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.JoinPage })));
const PublicMemberProfile = React.lazy(() => import('@frontend/features/public/PublicPages').then(module => ({ default: module.PublicMemberProfile })));

const MembershipApply = React.lazy(() => import('@frontend/features/membership/MembershipApply'));
const AdminMemberships = React.lazy(() => import('@frontend/features/admin/AdminMemberships'));
const Dashboard = React.lazy(() => import('@frontend/features/dashboard/Dashboard'));
const CEOPanel = React.lazy(() => import('@frontend/features/dashboard/CEOPanel'));
const MissionControl = React.lazy(() => import('@frontend/features/mission-control/MissionControl'));
const TasksHub = React.lazy(() => import('@frontend/features/tasks/TasksHub'));
const ChatPage = React.lazy(() => import('@frontend/features/chat/ChatPage'));
const ProfilePage = React.lazy(() => import('@frontend/features/profile/ProfilePage'));
const ProfileEdit = React.lazy(() => import('@frontend/features/profile/ProfileEdit'));
const LeaderboardsPage = React.lazy(() => import('@frontend/features/leaderboards/LeaderboardsPage'));
const ExperimentsLab = React.lazy(() => import('@frontend/features/experiments/ExperimentsLab'));
const ExperimentDetail = React.lazy(() => import('@frontend/features/experiments/ExperimentDetail'));
const ProductsMarketplace = React.lazy(() => import('@frontend/features/products/ProductsMarketplace'));
const ProductDetail = React.lazy(() => import('@frontend/features/products/ProductDetail'));
const CreativeHub = React.lazy(() => import('@frontend/features/creative/CreativeHub'));
const CreativeDetail = React.lazy(() => import('@frontend/features/creative/CreativeDetail'));
const CreativityPage = React.lazy(() => import('@frontend/features/creative/CreativityPage'));
const ChallengesPage = React.lazy(() => import('@frontend/features/challenges/ChallengesPage'));
const SkillsHub = React.lazy(() => import('@frontend/features/skills/SkillsHub'));
const SkillDetail = React.lazy(() => import('@frontend/features/skills/SkillDetail'));
const AIOS = React.lazy(() => import('@frontend/features/ai/AIOS'));
const AccessDenied = React.lazy(() => import('@frontend/features/auth/AccessDenied'));
const SignIn = React.lazy(() => import('@frontend/features/auth/SignIn'));
const SignUp = React.lazy(() => import('@frontend/features/auth/SignUp'));
const WorkspaceDashboard = React.lazy(() => import('@frontend/features/digital-workspace/WorkspaceDashboard'));
const WorkspaceDetail = React.lazy(() => import('@frontend/features/digital-workspace/WorkspaceDetail'));
const ModulePage = React.lazy(() => import('@frontend/features/dashboard/ModulePage'));
const NotificationsCenter = React.lazy(() => import('@frontend/features/notifications/NotificationsCenter'));
// --- Admin Routes (Lazy Loaded) ---
const AdminLayout = React.lazy(() => import('@frontend/features/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('@frontend/features/admin/AdminDashboard'));
const AdminMembers = React.lazy(() => import('@frontend/features/admin/AdminMembers'));
const AdminRoles = React.lazy(() => import('@frontend/features/admin/AdminRoles'));
const AdminContent = React.lazy(() => import('@frontend/features/admin/AdminContent'));
const AdminGamification = React.lazy(() => import('@frontend/features/admin/AdminGamification'));
const AdminAuditLogs = React.lazy(() => import('@frontend/features/admin/AdminAuditLogs'));
const AdminAnalytics = React.lazy(() => import('@frontend/features/admin/AdminAnalytics'));
const AdminSecurity = React.lazy(() => import('@frontend/features/admin/AdminSecurity'));
const AdminEvents = React.lazy(() => import('@frontend/features/admin/AdminEvents'));
const AdminInnovation = React.lazy(() => import('@frontend/features/admin/AdminInnovation'));
const CommandCenter = React.lazy(() => import('@frontend/features/admin/CommandCenter'));
const MembershipCenter = React.lazy(() => import('@frontend/features/admin/MembershipCenter'));
const ExecutiveAIAssistant = React.lazy(() => import('@frontend/features/admin/ExecutiveAIAssistant'));
const ExecutiveRoleManagement = React.lazy(() => import('@frontend/features/admin/ExecutiveRoleManagement'));

// --- Research System (Phase 18) ---
const FunResearchMode = React.lazy(() => import('@frontend/features/research/FunResearchMode'));
const ResearchChallenges = React.lazy(() => import('@frontend/features/research/ResearchChallenges'));
const DiscoveryFeed = React.lazy(() => import('@frontend/features/research/DiscoveryFeed'));
const ResearchArena = React.lazy(() => import('@frontend/features/research/ResearchArena'));
const AIResearchSimulator = React.lazy(() => import('@frontend/features/research/AIResearchSimulator'));
const ResearchAnalytics = React.lazy(() => import('@frontend/features/research/ResearchAnalytics'));
const ResearchCertificates = React.lazy(() => import('@frontend/features/research/ResearchCertificates'));
const FeaturedResearch = React.lazy(() => import('@frontend/features/research/FeaturedResearch'));
const ResearchLeaderboards = React.lazy(() => import('@frontend/features/research/ResearchLeaderboards'));
const ResearchLevels = React.lazy(() => import('@frontend/features/research/ResearchLevels'));
const ResearchBuilderWizard = React.lazy(() => import('@frontend/features/research/ResearchBuilderWizard'));
const AICoAuthor = React.lazy(() => import('@frontend/features/research/AICoAuthor'));
const ResearchNotebook = React.lazy(() => import('@frontend/features/research/ResearchNotebook'));
const MediaSupport = React.lazy(() => import('@frontend/features/research/MediaSupport'));
const ExperimentConnection = React.lazy(() => import('@frontend/features/research/ExperimentConnection'));
const AIResearchReviewer = React.lazy(() => import('@frontend/features/research/AIResearchReviewer'));
const DiscussionArea = React.lazy(() => import('@frontend/features/research/DiscussionArea'));
const TeenGamification = React.lazy(() => import('@frontend/features/research/TeenGamification'));

// --- Chat System (Phase 20) ---
const RichMessageComposer = React.lazy(() => import('@frontend/features/chat/RichMessageComposer'));
const FunChatEffects = React.lazy(() => import('@frontend/features/chat/FunChatEffects'));
const AIInsideChat = React.lazy(() => import('@frontend/features/chat/AIInsideChat'));
const VoiceMessages = React.lazy(() => import('@frontend/features/chat/VoiceMessages'));
const VoiceRooms = React.lazy(() => import('@frontend/features/chat/VoiceRooms'));
const VideoMeetings = React.lazy(() => import('@frontend/features/chat/VideoMeetings'));
const SharedMedia = React.lazy(() => import('@frontend/features/chat/SharedMedia'));
const ChatGames = React.lazy(() => import('@frontend/features/chat/ChatGames'));
const AchievementCelebrations = React.lazy(() => import('@frontend/features/chat/AchievementCelebrations'));
const MemberProfilesInChat = React.lazy(() => import('@frontend/features/chat/MemberProfilesInChat'));
const SmartFilters = React.lazy(() => import('@frontend/features/chat/SmartFilters'));
const MobileChatExperience = React.lazy(() => import('@frontend/features/chat/MobileChatExperience'));

// --- AI Studio (Phase 21) ---
const PromptEngineeringCenter = React.lazy(() => import('@frontend/features/ai-studio/PromptEngineeringCenter'));
const InteractivePromptPlayground = React.lazy(() => import('@frontend/features/ai-studio/InteractivePromptPlayground'));
const PromptAnalyzer = React.lazy(() => import('@frontend/features/ai-studio/PromptAnalyzer'));
const PromptChallenges = React.lazy(() => import('@frontend/features/ai-studio/PromptChallenges'));
const AITrainingCenter = React.lazy(() => import('@frontend/features/ai-studio/AITrainingCenter'));
const AITestingLab = React.lazy(() => import('@frontend/features/ai-studio/AITestingLab'));
const AIAnalytics = React.lazy(() => import('@frontend/features/ai-studio/AIAnalytics'));
const AIVersionControl = React.lazy(() => import('@frontend/features/ai-studio/AIVersionControl'));
const AICollections = React.lazy(() => import('@frontend/features/ai-studio/AICollections'));
const AICompetitions = React.lazy(() => import('@frontend/features/ai-studio/AICompetitions'));
const AIAchievements = React.lazy(() => import('@frontend/features/ai-studio/AIAchievements'));
const AILearningAcademy = React.lazy(() => import('@frontend/features/ai-studio/AILearningAcademy'));
const FunAIFeatures = React.lazy(() => import('@frontend/features/ai-studio/FunAIFeatures'));

// Robust lazy loading helper with automatic retry for dynamic import failure
const safeLazy = (importFn) =>
  React.lazy(() =>
    importFn().catch((error) => {
      console.warn('Dynamic import failed, retrying chunk load...', error);
      return new Promise((resolve) => setTimeout(resolve, 300))
        .then(importFn)
        .catch(() => {
          const key = 'chunk_reload_retry';
          const now = Date.now();
          if (!sessionStorage.getItem(key) || now - Number(sessionStorage.getItem(key)) > 10000) {
            sessionStorage.setItem(key, String(now));
            window.location.reload();
          }
          throw error;
        });
    })
  );

// --- FunFlix (Phase 22) ---
const CinematicHero = safeLazy(() => import('@frontend/features/funflix/CinematicHero'));
const BeautifulCategories = safeLazy(() => import('@frontend/features/funflix/BeautifulCategories'));
const HoverExperience = safeLazy(() => import('@frontend/features/funflix/HoverExperience'));
const RichCreatorProfiles = safeLazy(() => import('@frontend/features/funflix/RichCreatorProfiles'));
const CreatorLevels = safeLazy(() => import('@frontend/features/funflix/CreatorLevels'));
const MovieUploadWizard = safeLazy(() => import('@frontend/features/funflix/MovieUploadWizard'));
const AIMovieAssistant = safeLazy(() => import('@frontend/features/funflix/AIMovieAssistant'));
const InteractiveWatching = React.lazy(() => import('@frontend/features/funflix/InteractiveWatching'));
const WatchParties = React.lazy(() => import('@frontend/features/funflix/WatchParties'));
const Series = React.lazy(() => import('@frontend/features/funflix/Series'));
const Recommendations = React.lazy(() => import('@frontend/features/funflix/Recommendations'));
const MovieAnalytics = React.lazy(() => import('@frontend/features/funflix/MovieAnalytics'));
const Achievements = React.lazy(() => import('@frontend/features/funflix/Achievements'));
const Playlists = React.lazy(() => import('@frontend/features/funflix/Playlists'));
const AIDiscovery = React.lazy(() => import('@frontend/features/funflix/AIDiscovery'));
const MobileExperience = React.lazy(() => import('@frontend/features/funflix/MobileExperience'));
const DesignPhilosophy = React.lazy(() => import('@frontend/features/funflix/DesignPhilosophy'));

// --- Portfolio (Phase 23) ---
const VerificationBadges = React.lazy(() => import('@frontend/features/portfolio/VerificationBadges'));
const SocialLinks = React.lazy(() => import('@frontend/features/portfolio/SocialLinks'));
const QuickStatistics = React.lazy(() => import('@frontend/features/portfolio/QuickStatistics'));
const AboutSection = React.lazy(() => import('@frontend/features/portfolio/AboutSection'));
const Skills = React.lazy(() => import('@frontend/features/portfolio/Skills'));
const Education = React.lazy(() => import('@frontend/features/portfolio/Education'));
const Experience = React.lazy(() => import('@frontend/features/portfolio/Experience'));
const AutoPopulatedSections = React.lazy(() => import('@frontend/features/portfolio/AutoPopulatedSections'));
const DiscoveriesInventions = React.lazy(() => import('@frontend/features/portfolio/DiscoveriesInventions'));
const MarketplaceShowcaseFunFlixAIStudio = React.lazy(() => import('@frontend/features/portfolio/MarketplaceShowcaseFunFlixAIStudio'));
const AchievementsCertificates = React.lazy(() => import('@frontend/features/portfolio/AchievementsCertificates'));
const LeaderboardHistory = React.lazy(() => import('@frontend/features/portfolio/LeaderboardHistory'));
const Timeline = React.lazy(() => import('@frontend/features/portfolio/Timeline'));
const ActivityFeed = React.lazy(() => import('@frontend/features/portfolio/ActivityFeed'));
const FollowersRecommendations = React.lazy(() => import('@frontend/features/portfolio/FollowersRecommendations'));
const ContactPrivacy = React.lazy(() => import('@frontend/features/portfolio/ContactPrivacy'));
const Analytics = React.lazy(() => import('@frontend/features/portfolio/Analytics'));
const PortfolioCustomization = React.lazy(() => import('@frontend/features/portfolio/PortfolioCustomization'));
const PortfolioSharing = React.lazy(() => import('@frontend/features/portfolio/PortfolioSharing'));

// --- Dashboard (Phase 24) ---
const DashboardHeader = React.lazy(() => import('@frontend/features/dashboard/DashboardHeader'));
const UserProfileCard = React.lazy(() => import('@frontend/features/dashboard/UserProfileCard'));
const MembershipBadge = React.lazy(() => import('@frontend/features/dashboard/MembershipBadge'));
const DashboardStatistics = React.lazy(() => import('@frontend/features/dashboard/DashboardStatistics'));
const TodayTasks = React.lazy(() => import('@frontend/features/dashboard/TodayTasks'));
const MyProjects = React.lazy(() => import('@frontend/features/dashboard/MyProjects'));
const MyExperiments = React.lazy(() => import('@frontend/features/dashboard/MyExperiments'));
const AIRecommendations = React.lazy(() => import('@frontend/features/dashboard/AIRecommendations'));
const Announcements = React.lazy(() => import('@frontend/features/dashboard/Announcements'));
const RecentActivity = React.lazy(() => import('@frontend/features/dashboard/RecentActivity'));
const NotificationsWidget = React.lazy(() => import('@frontend/features/dashboard/NotificationsWidget'));
const CalendarWidget = React.lazy(() => import('@frontend/features/dashboard/CalendarWidget'));
const EventsSection = React.lazy(() => import('@frontend/features/dashboard/EventsSection'));
const LeaderboardPreview = React.lazy(() => import('@frontend/features/dashboard/LeaderboardPreview'));
const LearningProgress = React.lazy(() => import('@frontend/features/dashboard/LearningProgress'));
const ResearchSnapshot = React.lazy(() => import('@frontend/features/dashboard/ResearchSnapshot'));
const MarketplaceSnapshot = React.lazy(() => import('@frontend/features/dashboard/MarketplaceSnapshot'));
const ShowcasePreview = React.lazy(() => import('@frontend/features/dashboard/ShowcasePreview'));
const FunFlixPreview = React.lazy(() => import('@frontend/features/dashboard/FunFlixPreview'));
const TeamOverview = React.lazy(() => import('@frontend/features/dashboard/TeamOverview'));
const PersonalGoals = React.lazy(() => import('@frontend/features/dashboard/PersonalGoals'));
const DailyStreak = React.lazy(() => import('@frontend/features/dashboard/DailyStreak'));
const AIAssistantPanel = React.lazy(() => import('@frontend/features/dashboard/AIAssistantPanel'));
const PerformanceRequirements = React.lazy(() => import('@frontend/features/dashboard/PerformanceRequirements'));
const MobileDashboardRequirements = React.lazy(() => import('@frontend/features/dashboard/MobileDashboardRequirements'));

// --- Settings (Phase 25) ---
const ProfileSettings = React.lazy(() => import('@frontend/features/settings/ProfileSettings'));
const AccountSettings = React.lazy(() => import('@frontend/features/settings/AccountSettings'));
const SecuritySettings = React.lazy(() => import('@frontend/features/settings/SecuritySettings'));
const AppearanceSettings = React.lazy(() => import('@frontend/features/settings/AppearanceSettings'));
const AIPreferences = React.lazy(() => import('@frontend/features/settings/AIPreferences'));
const LanguageSettings = React.lazy(() => import('@frontend/features/settings/LanguageSettings'));
const PrivacySettings = React.lazy(() => import('@frontend/features/settings/PrivacySettings'));
const ContentPreferences = React.lazy(() => import('@frontend/features/settings/ContentPreferences'));
const NotificationPreferences = React.lazy(() => import('@frontend/features/settings/NotificationPreferences'));
const ConnectedAccounts = React.lazy(() => import('@frontend/features/settings/ConnectedAccounts'));
const StorageSettings = React.lazy(() => import('@frontend/features/settings/StorageSettings'));
const AboutSettings = React.lazy(() => import('@frontend/features/settings/AboutSettings'));
const SettingsUX = React.lazy(() => import('@frontend/features/settings/SettingsUX'));

// --- Notifications (Phase 26) ---
const NotificationCenter = React.lazy(() => import('@frontend/features/notifications/NotificationCenter'));
const NotificationTypes = React.lazy(() => import('@frontend/features/notifications/NotificationTypes'));
const RealTimeDelivery = React.lazy(() => import('@frontend/features/notifications/RealTimeDelivery'));
const NotificationActions = React.lazy(() => import('@frontend/features/notifications/NotificationActions'));
const SmartFiltering = React.lazy(() => import('@frontend/features/notifications/SmartFiltering'));
const NotificationSearch = React.lazy(() => import('@frontend/features/notifications/NotificationSearch'));
const NotificationSettings = React.lazy(() => import('@frontend/features/notifications/NotificationSettings'));
const ExecutiveNotifications = React.lazy(() => import('@frontend/features/notifications/ExecutiveNotifications'));
const NotificationDesign = React.lazy(() => import('@frontend/features/notifications/NotificationDesign'));

// --- Presence (Phase 27) ---
const PresenceStatus = React.lazy(() => import('@frontend/features/presence/PresenceStatus'));
const RichPresence = React.lazy(() => import('@frontend/features/presence/RichPresence'));
const LastSeen = React.lazy(() => import('@frontend/features/presence/LastSeen'));
const ActiveDevice = React.lazy(() => import('@frontend/features/presence/ActiveDevice'));
const PresencePrivacy = React.lazy(() => import('@frontend/features/presence/PresencePrivacy'));
const PresenceInChat = React.lazy(() => import('@frontend/features/presence/PresenceInChat'));

const ExecutivePresence = React.lazy(() => import('@frontend/features/presence/ExecutivePresence'));
const TechnicalArchitecture = React.lazy(() => import('@frontend/features/presence/TechnicalArchitecture'));
const FailureHandling = React.lazy(() => import('@frontend/features/presence/FailureHandling'));
const PresenceDesign = React.lazy(() => import('@frontend/features/presence/PresenceDesign'));

// --- QA (Phase 15) ---
const CrossBrowserVerification = React.lazy(() => import('@frontend/features/qa/CrossBrowserVerification'));
const ProductionLaunch = React.lazy(() => import('@frontend/features/qa/ProductionLaunch'));

// --- Executive (Phase 16) ---
const AdminExecutiveNotifications = React.lazy(() => import('@frontend/features/admin/ExecutiveNotifications'));
const ExecutiveSecurity = React.lazy(() => import('@frontend/features/admin/ExecutiveSecurity'));

// --- Intelligence & Predictive AI OS (Step 35) ---
const TrendAnalytics = React.lazy(() => import('@frontend/features/intelligence/TrendAnalytics'));
const ReportsAutomation = React.lazy(() => import('@frontend/features/intelligence/ReportsAutomation'));
const IntelligenceAlerts = React.lazy(() => import('@frontend/features/intelligence/IntelligenceAlerts'));
const AIExecutiveAdvisor = React.lazy(() => import('@frontend/features/intelligence/AIExecutiveAdvisor'));
const AdminIntelligence = React.lazy(() => import('@frontend/features/admin/AdminIntelligence'));

// --- Ecosystem Expansion & Legacy OS (Step 36) ---
const EcosystemHub = React.lazy(() => import('@frontend/features/ecosystem/EcosystemHub'));
const ChaptersHub = React.lazy(() => import('@frontend/features/ecosystem/ChaptersHub'));
const AmbassadorHub = React.lazy(() => import('@frontend/features/ecosystem/AmbassadorHub'));
const InstitutionHub = React.lazy(() => import('@frontend/features/ecosystem/InstitutionHub'));
const ProgramsHub = React.lazy(() => import('@frontend/features/ecosystem/ProgramsHub'));
const LegacyCenter = React.lazy(() => import('@frontend/features/legacy/LegacyCenter'));
const LegacyHallOfFame = React.lazy(() => import('@frontend/features/legacy/HallOfFame'));
const GlobalRankings = React.lazy(() => import('@frontend/features/legacy/GlobalRankings'));
const AILegacyAdvisor = React.lazy(() => import('@frontend/features/legacy/AILegacyAdvisor'));
const AdminEcosystem = React.lazy(() => import('@frontend/features/admin/AdminEcosystem'));

// --- Mission Control Routes (Lazy Loaded) ---
const MissionControlLayout = React.lazy(() => import('@frontend/features/mission-control/MissionControlLayout'));
const MissionControlDashboard = React.lazy(() => import('@frontend/features/mission-control/MissionControlDashboard'));
const ExecutiveAlerts = React.lazy(() => import('@frontend/features/mission-control/ExecutiveAlerts'));
const ProjectHealth = React.lazy(() => import('@frontend/features/mission-control/ProjectHealth'));
const MemberAnalytics = React.lazy(() => import('@frontend/features/mission-control/MemberAnalytics'));
const GlobalSearch = React.lazy(() => import('@frontend/features/mission-control/GlobalSearch'));
const ReportsCenter = React.lazy(() => import('@frontend/features/mission-control/ReportsCenter'));
const AIInsights = React.lazy(() => import('@frontend/features/mission-control/AIInsights'));
const InnovationHealth = React.lazy(() => import('@frontend/features/mission-control/InnovationHealth'));

// --- Events & Challenges (Step 16) ---
const EventsPage = React.lazy(() => import('@frontend/features/events/EventsPage'));
const EventDetail = React.lazy(() => import('@frontend/features/events/EventDetail'));
const ChallengeDetail = React.lazy(() => import('@frontend/features/events/ChallengeDetail'));

// --- Portfolios & Certificates (Step 17) ---
const PortfolioShowcase = React.lazy(() => import('@frontend/features/portfolio/PortfolioShowcase'));
const PortfolioPage = React.lazy(() => import('@frontend/features/portfolio/PortfolioPage'));
const PortfolioShare = React.lazy(() => import('@frontend/features/portfolio/PortfolioShare'));
const CertificateView = React.lazy(() => import('@frontend/features/portfolio/CertificateView'));

// --- Developer & Integration OS (Step 38) ---
const DeveloperPortal = React.lazy(() => import('@frontend/features/developer/DeveloperPortal'));
const APIKeysCenter = React.lazy(() => import('@frontend/features/developer/APIKeysCenter'));
const WebhookCenter = React.lazy(() => import('@frontend/features/developer/WebhookCenter'));
const SDKCenter = React.lazy(() => import('@frontend/features/developer/SDKCenter'));
const DeveloperMarketplace = React.lazy(() => import('@frontend/features/developer/DeveloperMarketplace'));
const AIProviderCenter = React.lazy(() => import('@frontend/features/integrations/AIProviderCenter'));
const ProductivityIntegrations = React.lazy(() => import('@frontend/features/integrations/ProductivityIntegrations'));
const ResearchIntegrations = React.lazy(() => import('@frontend/features/integrations/ResearchIntegrations'));
const LearningIntegrations = React.lazy(() => import('@frontend/features/integrations/LearningIntegrations'));
const CommunicationHub = React.lazy(() => import('@frontend/features/integrations/CommunicationHub'));
const EnterpriseIntegrations = React.lazy(() => import('@frontend/features/integrations/EnterpriseIntegrations'));
const IntegrationSecurityCenter = React.lazy(() => import('@frontend/features/integrations/IntegrationSecurityCenter'));

// --- Global Ecosystem & Legacy (Step 39) ---
const GlobalEventsHub = React.lazy(() => import('@frontend/features/global-ecosystem/GlobalEventsHub'));
const GlobalSearchCenter = React.lazy(() => import('@frontend/features/global-ecosystem/GlobalSearchCenter'));
const ComplianceCenter = React.lazy(() => import('@frontend/features/global-ecosystem/ComplianceCenter'));
const GlobalMissionControl = React.lazy(() => import('@frontend/features/global-ecosystem/GlobalMissionControl'));
const AdminGlobalEcosystem = React.lazy(() => import('@frontend/features/global-ecosystem/AdminGlobalEcosystem'));

const RecognitionCenter = React.lazy(() => import('@frontend/features/legacy/RecognitionCenter'));
const TimelineCenter = React.lazy(() => import('@frontend/features/legacy/TimelineCenter'));

// --- Platform Hardening & Launch (Step 40) ---
const SecurityCenter = React.lazy(() => import('@frontend/features/platform/SecurityCenter'));
const SEOHealthCenter = React.lazy(() => import('@frontend/features/platform/SEOHealthCenter'));
const MonitoringCenter = React.lazy(() => import('@frontend/features/platform/MonitoringCenter'));
const BackupCenter = React.lazy(() => import('@frontend/features/platform/BackupCenter'));
const DocumentationCenter = React.lazy(() => import('@frontend/features/platform/DocumentationCenter'));
const LaunchCenter = React.lazy(() => import('@frontend/features/platform/LaunchCenter'));
const PlatformCertificationCenter = React.lazy(() => import('@frontend/features/platform/PlatformCertificationCenter'));
const ReleaseManager = React.lazy(() => import('@frontend/features/platform/ReleaseManager'));

// --- FunFlix OS (Step 41) ---
const FunFlixHub = React.lazy(() => import('@frontend/features/funflix/FunFlixHub'));
const MoviePlayer = React.lazy(() => import('@frontend/features/funflix/MoviePlayer'));
const FunFlixCreatorProfile = React.lazy(() => import('@frontend/features/funflix/CreatorProfile'));
const MoviePlaylists = React.lazy(() => import('@frontend/features/funflix/MoviePlaylists'));
const AIFunFlixAssistant = React.lazy(() => import('@frontend/features/funflix/AIFunFlixAssistant'));
const FunFlixAnalytics = React.lazy(() => import('@frontend/features/mission-control/FunFlixAnalytics'));
const AdminFunFlix = React.lazy(() => import('@frontend/features/admin/AdminFunFlix'));

// --- AI Creator Studio & Marketplace (Step 42) ---
const AIStudioUnified = React.lazy(() => import('@frontend/features/ai-creator/AIStudioUnified'));
const AIProfilePage = React.lazy(() => import('@frontend/features/ai-creator/AIProfilePage'));
const AIChatPage = React.lazy(() => import('@frontend/features/ai-creator/AIChatPage'));
const AIMarketplaceBrowser = React.lazy(() => import('@frontend/features/ai-creator/AIMarketplaceBrowser'));
const AIEcosystemAnalytics = React.lazy(() => import('@frontend/features/mission-control/AIEcosystemAnalytics'));
const AdminAIStudio = React.lazy(() => import('@frontend/features/admin/AdminAIStudio'));

// Mobile/Desktop mock views
const MobileDashboard = React.lazy(() => import('@frontend/mobile/MobileDashboard'));
const DesktopHub = React.lazy(() => import('@frontend/desktop/DesktopHub'));

// --- Universe OS (Step 28) ---
const UniverseHome = React.lazy(() => import('@frontend/features/universe/UniverseHome'));
const UnifiedSearchPage = React.lazy(() => import('@frontend/features/universe/UnifiedSearchPage'));
const UniverseGoals = React.lazy(() => import('@frontend/features/universe/UniverseGoals'));
const AdminUniverse = React.lazy(() => import('@frontend/features/admin/AdminUniverse'));
const UniverseAnalytics = React.lazy(() => import('@frontend/features/mission-control/UniverseAnalytics'));

// --- Generic Fullscreen Loader ---
export const FullScreenLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center w-full">
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,255,255,0.5)]"></div>
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

  const membershipStatus = roleData?.membershipStatus;
  const normalizedRole = roleData?.role?.toLowerCase().trim();
  const isAdmin = hasPermission(roleData?.role, 'canAccessCeoPanel') || 
                  normalizedRole === 'main ceo' || 
                  normalizedRole === 'co-ceo' || 
                  normalizedRole === 'co ceo';

  // Check membership status if requireMember is true
  if (requireMember && membershipStatus !== 'approved' && !isAdmin) {
    return <Navigate to="/membership/apply" replace />;
  }

  if (requireCeo && !hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requireAdmin && !hasPermission(roleData?.role, 'canAccessAdmin')) {
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
        
        {/* Public Routes - Accessible without authentication */}
        <Route element={<ProtectedRoute requireAuth={false}><PublicLayout /></ProtectedRoute>}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/about" element={<PublicAbout />} />
          <Route path="/experiments" element={<PublicExperiments />} />
          <Route path="/public-marketplace" element={<PublicMarketplace />} />
          <Route path="/projects" element={<PublicProjects />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/members/:uid" element={<PublicMemberProfile />} />
        </Route>
        <Route path="/access-denied" element={<AccessDenied />} />
        
        {/* Membership Routes - Public for authenticated users */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/membership/apply" element={<MembershipApply />} />
        </Route>
        
        {/* AppShell Protected Routes - Member only dashboard and apps */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ProtectedRoute requireMember><Dashboard /></ProtectedRoute>} />
          <Route path="/universe" element={<ProtectedRoute requireMember><UniverseHome /></ProtectedRoute>} />
          <Route path="/universe/goals" element={<ProtectedRoute requireMember><UniverseGoals /></ProtectedRoute>} />
          <Route path="/search" element={<UnifiedSearchPage />} />
          
          {/* Standalone pages outside the main layout */}
          <Route path="/auth/login" element={<SignIn />} />
          <Route path="/auth/register" element={<SignUp />} />
          
          {/* Mobile / Desktop apps */}
          <Route path="/mobile" element={<MobileDashboard />} />
          <Route path="/desktop" element={<DesktopHub />} />

          <Route path="/tasks" element={<TasksHub />} />
          <Route path="/chat" element={<ProtectedRoute requireMember><ChatPage /></ProtectedRoute>} />
          <Route path="/workspace" element={<WorkspaceDashboard />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/workspace/experiments" element={<ProtectedRoute requireMember><ExperimentsLab /></ProtectedRoute>} />
          <Route path="/workspace/experiments/:experimentId" element={<ExperimentDetail />} />
          <Route path="/workspace/products" element={<ProtectedRoute requireMember><ProductsMarketplace /></ProtectedRoute>} />
          <Route path="/workspace/products/:productId" element={<ProductDetail />} />
          <Route path="/workspace/creative" element={<CreativeHub />} />
          <Route path="/workspace/creative/:id" element={<CreativeDetail />} />
          <Route path="/creativity" element={<CreativityPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          
          {/* ========================================
              ORGANIZATION OS ROUTES (Step 20) - Member Only
              ======================================== */}
          <Route path="/creative" element={<ModulePage type="creative" />} />
          <Route path="/workspace/skills" element={<SkillsHub />} />
          <Route path="/workspace/skills/:skillId" element={<SkillDetail />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/notifications" element={<NotificationsCenter />} />
          <Route path="/ai" element={<AIOS />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/:uid/edit" element={<ProfileEdit />} />
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

          {/* Mission Control (Phase 29) */}
          <Route
            path="/mission-control"
            element={
              <ProtectedRoute requireCeo>
                <MissionControl />
              </ProtectedRoute>
            }
          />

          {/* Executive Routes (Phase 16) */}
          <Route
            path="/command-center"
            element={
              <ProtectedRoute requireCeo>
                <CommandCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-center"
            element={
              <ProtectedRoute requireCeo>
                <MembershipCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive-ai"
            element={
              <ProtectedRoute requireCeo>
                <ExecutiveAIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive-notifications"
            element={
              <ProtectedRoute requireCeo>
                <AdminExecutiveNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive-security"
            element={
              <ProtectedRoute requireCeo>
                <ExecutiveSecurity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive-role-management"
            element={
              <ProtectedRoute requireCeo>
                <ExecutiveRoleManagement />
              </ProtectedRoute>
            }
          />

          {/* ========================================
              EVENTS & CHALLENGES ROUTES (Step 16)
              ======================================== */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/challenges/:challengeId" element={<ChallengeDetail />} />

          {/* ========================================
              PORTFOLIOS & CERTIFICATES ROUTES (Step 17)
              ======================================== */}
          <Route path="/portfolios" element={<PortfolioShowcase />} />
          <Route path="/portfolio" element={<Navigate to="/portfolios" replace />} />
          <Route path="/portfolio/:username" element={<PortfolioPage />} />
          <Route path="/portfolio/:username/share" element={<PortfolioShare />} />
          <Route path="/verify/:certId" element={<CertificateView />} />

          {/* ========================================
              ACHIEVEMENTS ROUTES
              ======================================== */}
          <Route path="/achievements" element={<Navigate to="/portfolios" replace />} />

          {/* ========================================
              DEVELOPER & INTEGRATION OS (Step 38)
              ======================================== */}
          <Route path="/developer" element={<DeveloperPortal />} />
          <Route path="/developer/keys" element={<APIKeysCenter />} />
          <Route path="/developer/webhooks" element={<WebhookCenter />} />
          <Route path="/developer/sdks" element={<SDKCenter />} />
          <Route path="/developer/marketplace" element={<DeveloperMarketplace />} />
          
          <Route path="/integrations/ai-providers" element={<AIProviderCenter />} />
          <Route path="/integrations/productivity" element={<ProductivityIntegrations />} />
          <Route path="/integrations/research" element={<ResearchIntegrations />} />
          <Route path="/integrations/learning" element={<LearningIntegrations />} />
          <Route path="/integrations/communication" element={<CommunicationHub />} />
          <Route path="/integrations/enterprise" element={<EnterpriseIntegrations />} />
          <Route path="/integrations/security" element={<IntegrationSecurityCenter />} />

          {/* ========================================
              GLOBAL ECOSYSTEM & LEGACY (Step 39)
              ======================================== */}
          <Route path="/global/events" element={<GlobalEventsHub />} />
          <Route path="/global/search" element={<GlobalSearchCenter />} />
          <Route path="/global/compliance" element={<ComplianceCenter />} />
          <Route path="/mission-control/global" element={<GlobalMissionControl />} />
          <Route path="/admin/global" element={<AdminGlobalEcosystem />} />

          <Route path="/legacy/hall-of-fame" element={<LegacyCenter />} />
          <Route path="/legacy/recognition" element={<RecognitionCenter />} />
          <Route path="/legacy/timeline" element={<TimelineCenter />} />

          {/* ========================================
              PLATFORM HARDENING & LAUNCH (Step 40)
              ======================================== */}
          <Route path="/platform/security" element={<SecurityCenter />} />
          <Route path="/platform/seo" element={<SEOHealthCenter />} />
          <Route path="/platform/monitoring" element={<MonitoringCenter />} />
          <Route path="/platform/backup" element={<BackupCenter />} />
          <Route path="/platform/docs" element={<DocumentationCenter />} />
          <Route path="/platform/launch" element={<LaunchCenter />} />
          <Route path="/platform/certification" element={<PlatformCertificationCenter />} />
          <Route path="/platform/releases" element={<ReleaseManager />} />

          {/* ========================================
              FUNFLIX OS (Step 41)
              ======================================== */}
          <Route path="/funflix" element={<FunFlixHub />} />
          <Route path="/funflix/watch/:movieId" element={<MoviePlayer />} />
          <Route path="/funflix/creator/:username" element={<FunFlixCreatorProfile />} />
          <Route path="/funflix/upload" element={<ProtectedRoute requireMember><MovieUploadWizard /></ProtectedRoute>} />
          <Route path="/funflix/playlists" element={<ProtectedRoute requireMember><MoviePlaylists /></ProtectedRoute>} />
          <Route path="/funflix/ai" element={<AIFunFlixAssistant />} />
          <Route path="/mission-control/funflix" element={<FunFlixAnalytics />} />
          <Route path="/admin/funflix" element={<AdminFunFlix />} />

          {/* ========================================
              AI CREATOR STUDIO & MARKETPLACE (Step 42)
              ======================================== */}
          <Route path="/ai-studio" element={<AIStudioUnified />} />
          <Route path="/ais" element={<AIMarketplaceBrowser />} />
          <Route path="/ais/:aiId" element={<AIProfilePage />} />
          <Route path="/ais/:aiId/chat" element={<AIChatPage />} />
          <Route path="/mission-control/ai-ecosystem" element={<AIEcosystemAnalytics />} />
          <Route path="/admin/ai-studio" element={<AdminAIStudio />} />

          {/* ========================================
              RESEARCH SYSTEM ROUTES (Phase 18)
              ======================================== */}
          <Route path="/research/fun-mode" element={<FunResearchMode />} />
          <Route path="/research/challenges" element={<ResearchChallenges />} />
          <Route path="/research/discovery" element={<DiscoveryFeed />} />
          <Route path="/research/arena" element={<ResearchArena />} />
          <Route path="/research/simulator" element={<AIResearchSimulator />} />
          <Route path="/research/analytics" element={<ResearchAnalytics />} />
          <Route path="/research/certificates" element={<ResearchCertificates />} />
          <Route path="/research/featured" element={<FeaturedResearch />} />
          <Route path="/research/leaderboards" element={<ResearchLeaderboards />} />
          <Route path="/research/levels" element={<ResearchLevels />} />
          <Route path="/research/builder" element={<ProtectedRoute requireMember><ResearchBuilderWizard /></ProtectedRoute>} />
          <Route path="/research/coauthor" element={<AICoAuthor />} />
          <Route path="/research/notebook" element={<ResearchNotebook />} />
          <Route path="/research/media" element={<MediaSupport />} />
          <Route path="/research/experiments" element={<ExperimentConnection />} />
          <Route path="/research/reviewer" element={<AIResearchReviewer />} />
          <Route path="/research/discussion" element={<DiscussionArea />} />
          <Route path="/research/gamification" element={<TeenGamification />} />

          {/* ========================================
              CHAT SYSTEM ROUTES (Phase 20)
              ======================================== */}
          <Route path="/chat/composer" element={<RichMessageComposer />} />
          <Route path="/chat/effects" element={<FunChatEffects />} />
          <Route path="/chat/ai" element={<AIInsideChat />} />
          <Route path="/chat/voice" element={<VoiceMessages />} />
          <Route path="/chat/rooms" element={<VoiceRooms />} />
          <Route path="/chat/video" element={<VideoMeetings />} />
          <Route path="/chat/media" element={<SharedMedia />} />
          <Route path="/chat/games" element={<ChatGames />} />
          <Route path="/chat/achievements" element={<AchievementCelebrations />} />
          <Route path="/chat/profiles" element={<MemberProfilesInChat />} />
          <Route path="/chat/filters" element={<SmartFilters />} />
          <Route path="/chat/mobile" element={<MobileChatExperience />} />

          {/* ========================================
              AI STUDIO ROUTES (Phase 21)
              ======================================== */}
          <Route path="/ai-studio/prompt-center" element={<PromptEngineeringCenter />} />
          <Route path="/ai-studio/playground" element={<InteractivePromptPlayground />} />
          <Route path="/ai-studio/analyzer" element={<PromptAnalyzer />} />
          <Route path="/ai-studio/challenges" element={<PromptChallenges />} />
          <Route path="/ai-studio/training" element={<AITrainingCenter />} />
          <Route path="/ai-studio/testing" element={<AITestingLab />} />
          <Route path="/ai-studio/analytics" element={<AIAnalytics />} />
          <Route path="/ai-studio/version-control" element={<AIVersionControl />} />
          <Route path="/ai-studio/collections" element={<AICollections />} />
          <Route path="/ai-studio/competitions" element={<AICompetitions />} />
          <Route path="/ai-studio/achievements" element={<AIAchievements />} />
          <Route path="/ai-studio/academy" element={<AILearningAcademy />} />
          <Route path="/ai-studio/fun" element={<FunAIFeatures />} />

          {/* ========================================
              FUNFLIX ROUTES (Phase 22)
              ======================================== */}
          <Route path="/funflix/cinematic-hero" element={<CinematicHero />} />
          <Route path="/funflix/categories" element={<BeautifulCategories />} />
          <Route path="/funflix/hover" element={<HoverExperience />} />
          <Route path="/funflix/creator-profiles" element={<RichCreatorProfiles />} />
          <Route path="/funflix/creator-levels" element={<CreatorLevels />} />
          <Route path="/funflix/ai-assistant" element={<AIMovieAssistant />} />
          <Route path="/funflix/interactive" element={<InteractiveWatching />} />
          <Route path="/funflix/watch-parties" element={<WatchParties />} />
          <Route path="/funflix/series" element={<Series />} />
          <Route path="/funflix/recommendations" element={<Recommendations />} />
          <Route path="/funflix/analytics" element={<MovieAnalytics />} />
          <Route path="/funflix/achievements" element={<Achievements />} />
          <Route path="/funflix/playlists" element={<Playlists />} />
          <Route path="/funflix/ai-discovery" element={<AIDiscovery />} />
          <Route path="/funflix/mobile" element={<MobileExperience />} />
          <Route path="/funflix/design" element={<DesignPhilosophy />} />

          {/* ========================================
              PORTFOLIO ROUTES (Phase 23)
              ======================================== */}
          <Route path="/portfolio/verification-badges" element={<VerificationBadges />} />
          <Route path="/portfolio/social-links" element={<SocialLinks />} />
          <Route path="/portfolio/statistics" element={<QuickStatistics />} />
          <Route path="/portfolio/about" element={<AboutSection />} />
          <Route path="/portfolio/skills" element={<Skills />} />
          <Route path="/portfolio/education" element={<Education />} />
          <Route path="/portfolio/experience" element={<Experience />} />
          <Route path="/portfolio/auto-populated" element={<AutoPopulatedSections />} />
          <Route path="/portfolio/discoveries-inventions" element={<DiscoveriesInventions />} />
          <Route path="/portfolio/marketplace-showcase" element={<MarketplaceShowcaseFunFlixAIStudio />} />
          <Route path="/portfolio/achievements-certificates" element={<AchievementsCertificates />} />
          <Route path="/portfolio/leaderboard-history" element={<LeaderboardHistory />} />
          <Route path="/portfolio/timeline" element={<Timeline />} />
          <Route path="/portfolio/activity-feed" element={<ActivityFeed />} />
          <Route path="/portfolio/followers-recommendations" element={<FollowersRecommendations />} />
          <Route path="/portfolio/contact-privacy" element={<ContactPrivacy />} />
          <Route path="/portfolio/analytics" element={<Analytics />} />
          <Route path="/portfolio/customization" element={<ProtectedRoute requireMember><PortfolioCustomization /></ProtectedRoute>} />
          <Route path="/portfolio/sharing" element={<PortfolioSharing />} />

          {/* ========================================
              DASHBOARD ROUTES (Phase 24)
              ======================================== */}
          <Route path="/dashboard/header" element={<DashboardHeader />} />
          <Route path="/dashboard/profile-card" element={<UserProfileCard />} />
          <Route path="/dashboard/membership-badge" element={<MembershipBadge />} />
          <Route path="/dashboard/statistics" element={<DashboardStatistics />} />
          <Route path="/dashboard/today-tasks" element={<TodayTasks />} />
          <Route path="/dashboard/my-projects" element={<MyProjects />} />
          <Route path="/dashboard/my-experiments" element={<MyExperiments />} />
          <Route path="/dashboard/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/dashboard/announcements" element={<Announcements />} />
          <Route path="/dashboard/recent-activity" element={<RecentActivity />} />
          <Route path="/dashboard/notifications" element={<NotificationsWidget />} />
          <Route path="/dashboard/calendar" element={<CalendarWidget />} />
          <Route path="/dashboard/events" element={<EventsSection />} />
          <Route path="/dashboard/leaderboard" element={<LeaderboardPreview />} />
          <Route path="/dashboard/learning-progress" element={<LearningProgress />} />
          <Route path="/dashboard/research-snapshot" element={<ResearchSnapshot />} />
          <Route path="/dashboard/marketplace-snapshot" element={<MarketplaceSnapshot />} />
          <Route path="/dashboard/showcase-preview" element={<ShowcasePreview />} />
          <Route path="/dashboard/funflix-preview" element={<FunFlixPreview />} />
          <Route path="/dashboard/team-overview" element={<TeamOverview />} />
          <Route path="/dashboard/personal-goals" element={<PersonalGoals />} />
          <Route path="/dashboard/daily-streak" element={<DailyStreak />} />
          <Route path="/dashboard/ai-assistant" element={<AIAssistantPanel />} />
          <Route path="/dashboard/performance" element={<PerformanceRequirements />} />
          <Route path="/dashboard/mobile" element={<MobileDashboardRequirements />} />

          {/* ========================================
              SETTINGS ROUTES (Phase 25)
              ======================================== */}
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/security" element={<SecuritySettings />} />
          <Route path="/settings/appearance" element={<AppearanceSettings />} />
          <Route path="/settings/ai" element={<AIPreferences />} />
          <Route path="/settings/language" element={<LanguageSettings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/content" element={<ContentPreferences />} />
          <Route path="/settings/notifications" element={<NotificationPreferences />} />
          <Route path="/settings/connected-accounts" element={<ConnectedAccounts />} />
          <Route path="/settings/storage" element={<StorageSettings />} />
          <Route path="/settings/about" element={<AboutSettings />} />
          <Route path="/settings/ux" element={<SettingsUX />} />

          {/* ========================================
              NOTIFICATIONS ROUTES (Phase 26)
              ======================================== */}
          <Route path="/notifications/center" element={<NotificationCenter />} />
          <Route path="/notifications/types" element={<NotificationTypes />} />
          <Route path="/notifications/realtime" element={<RealTimeDelivery />} />
          <Route path="/notifications/actions" element={<NotificationActions />} />
          <Route path="/notifications/filtering" element={<SmartFiltering />} />
          <Route path="/notifications/search" element={<NotificationSearch />} />
          <Route path="/notifications/settings" element={<NotificationSettings />} />
          <Route path="/notifications/executive" element={<ExecutiveNotifications />} />
          <Route path="/notifications/design" element={<NotificationDesign />} />

          {/* ========================================
              PRESENCE ROUTES (Phase 27)
              ======================================== */}
          <Route path="/presence/status" element={<PresenceStatus />} />
          <Route path="/presence/rich" element={<RichPresence />} />
          <Route path="/presence/last-seen" element={<LastSeen />} />
          <Route path="/presence/device" element={<ActiveDevice />} />
          <Route path="/presence/privacy" element={<PresencePrivacy />} />
          <Route path="/presence/chat" element={<PresenceInChat />} />

          <Route path="/presence/executive" element={<ExecutivePresence />} />
          <Route path="/presence/architecture" element={<TechnicalArchitecture />} />
          <Route path="/presence/failure" element={<FailureHandling />} />
          <Route path="/presence/design" element={<PresenceDesign />} />

          {/* ========================================
              QA ROUTES (Phase 15)
              ======================================== */}
          <Route path="/qa/browser-verification" element={<CrossBrowserVerification />} />
          <Route path="/qa/production-launch" element={<ProductionLaunch />} />

          {/* ========================================
              EXECUTIVE ROUTES (Phase 16)
              ======================================== */}
          <Route path="/executive/notifications" element={<AdminExecutiveNotifications />} />
          <Route path="/executive/security" element={<ExecutiveSecurity />} />

          {/* ========================================
              INTELLIGENCE & PREDICTIVE AI OS ROUTES (Step 35)
              ======================================== */}
          <Route path="/intelligence/trends" element={<TrendAnalytics />} />
          <Route path="/intelligence/reports" element={<ReportsAutomation />} />
          <Route path="/intelligence/alerts" element={<IntelligenceAlerts />} />
          <Route path="/intelligence/ai" element={<AIExecutiveAdvisor />} />

          {/* ========================================
              ECOSYSTEM & LEGACY OS ROUTES (Step 36)
              ======================================== */}
          <Route path="/ecosystem" element={<EcosystemHub />} />
          <Route path="/ecosystem/chapters" element={<ChaptersHub />} />
          <Route path="/ecosystem/ambassadors" element={<AmbassadorHub />} />
          <Route path="/ecosystem/institutions" element={<InstitutionHub />} />
          <Route path="/ecosystem/programs" element={<ProgramsHub />} />
          <Route path="/legacy" element={<LegacyCenter />} />
          <Route path="/legacy/hall-of-fame" element={<LegacyHallOfFame />} />
          <Route path="/legacy/rankings" element={<GlobalRankings />} />
          <Route path="/legacy/ai" element={<AILegacyAdvisor />} />

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
            <Route path="universe" element={<AdminUniverse />} />

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

            <Route path="members" element={<MemberAnalytics />} />
            <Route path="search" element={<GlobalSearch />} />
            <Route path="reports" element={<ReportsCenter />} />
            <Route path="ai" element={<AIInsights />} />
            <Route path="innovation" element={<InnovationHealth />} />
            <Route path="universe" element={<UniverseAnalytics />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}



