import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UsersService } from '../../services/firebase/users';
import { PortfolioService } from '../../services/firebase/portfolio';
import { LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  Award, 
  FolderKanban, 
  FlaskConical, 
  TrendingUp, 
  ExternalLink,
  Lock,
  Globe,
  Edit,
  Crown,
  Shield,
  Mail,
  Download,
  Share2,
  Star,
  Code,
  Palette,
  Zap,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Activity,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../../constants/roles';
import { PresenceService } from '../../services/realtime/presence';

// Theme Templates for Portfolio
const PORTFOLIO_THEMES = [
  {
    id: 'default',
    name: 'Default Dark',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    accentColor: '#00d4ff',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.05)'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accentColor: '#00d4ff',
    textColor: '#e94560',
    cardBg: 'rgba(0, 212, 255, 0.05)'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#f093fb',
    textColor: '#ffffff',
    cardBg: 'rgba(240, 147, 251, 0.05)'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    accentColor: '#a8e6cf',
    textColor: '#ffffff',
    cardBg: 'rgba(168, 230, 207, 0.05)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #2d1b4e 100%)',
    accentColor: '#ff00ff',
    textColor: '#00ff00',
    cardBg: 'rgba(255, 0, 255, 0.05)'
  }
];

function getVerificationHalo(role, badges) {
  if (role === ROLES.MAIN_CEO) {
    return {
      color: '#ffd700',
      glow: '0 0 20px rgba(255, 215, 0, 0.6)',
      label: 'CEO'
    };
  }
  if (role === ROLES.CO_CEO) {
    return {
      color: '#c0c0c0',
      glow: '0 0 20px rgba(192, 192, 192, 0.6)',
      label: 'Co-CEO'
    };
  }
  if (badges?.includes('mentor')) {
    return {
      color: '#00ff87',
      glow: '0 0 20px rgba(0, 255, 135, 0.6)',
      label: 'Mentor'
    };
  }
  if (badges?.includes('innovator')) {
    return {
      color: '#ff6b6b',
      glow: '0 0 20px rgba(255, 107, 107, 0.6)',
      label: 'Innovator'
    };
  }
  return null;
}

export default function PortfolioPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const uid = await UsersService.getUidForUsername(username);
        if (!uid) {
          setLoading(false);
          return;
        }

        const userProfile = await UsersService.getUserProfile(uid);
        setProfile(userProfile);
        setSelectedTheme(userProfile?.theme || 'default');

        // Load portfolio data with full information
        const portfolio = await PortfolioService.getPortfolioData(username);
        setPortfolioData(portfolio);

        // Load presence status
        const presence = await PresenceService.getUserPresence(uid);
        setStatus(presence);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [username]);

  const isOwnProfile = user?.uid === profile?.uid;
  const isCEO = profile?.role === ROLES.MAIN_CEO || profile?.role === ROLES.CO_CEO;
  const canEdit = isOwnProfile || isCEO;
  const verification = getVerificationHalo(profile?.role, profile?.badges);
  const state = status?.state || 'offline';
  const presenceColor = PresenceService.getPresenceColor(state);
  const presenceLabel = PresenceService.getPresenceLabel(state);

  const handlePrivacyToggle = async (section, isVisible) => {
    if (!isOwnProfile) return;
    
    try {
      await PortfolioService.updatePrivacySettings(profile.uid, {
        [section]: isVisible
      });
      setPortfolioData(prev => ({
        ...prev,
        privacy: { ...prev.privacy, [section]: isVisible }
      }));
    } catch (err) {
      console.error('Failed to update privacy:', err);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><LoadingState text="Loading portfolio..." /></div>;
  }

  if (!profile) {
    return <div className="p-20 text-center text-white font-bold text-2xl">Portfolio Not Found</div>;
  }

  const theme = PORTFOLIO_THEMES.find(t => t.id === selectedTheme) || PORTFOLIO_THEMES[0];
  const privacy = portfolioData?.privacy || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Portfolio Cover Section with Dynamic Styling */}
      <section 
        className="relative overflow-hidden border-b-2 p-8 md:p-12 lg:p-16 transition-all duration-500"
        style={{ 
          background: theme.background,
          borderColor: theme.accentColor,
          color: theme.textColor
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: theme.accentColor }} />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: theme.accentColor }} />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Avatar with Glowing Halo */}
            <div className="flex items-center gap-6">
              <div 
                className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 overflow-hidden rounded-2xl border-4 shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  borderColor: theme.accentColor,
                  boxShadow: verification?.glow || 'none'
                }}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-black" style={{ color: theme.accentColor }}>
                    {profile.displayName?.[0] || 'M'}
                  </div>
                )}
                <span className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 ${presenceColor}`} style={{ borderColor: theme.textColor }} />
                {verification && (
                  <div className="absolute -top-2 -right-2 rounded-full p-2" style={{ background: verification.color }}>
                    <Crown className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-heading text-3xl font-black md:text-4xl lg:text-5xl">
                  {profile.displayName || profile.username}
                </h1>
                <p className="mt-2 text-lg opacity-80">@{profile.username}</p>
                <div className="mt-2 flex items-center gap-2 opacity-70">
                  <span className={`h-2.5 w-2.5 rounded-full ${presenceColor}`} />
                  <span className="text-sm">{presenceLabel}</span>
                  {status?.activity && <span className="text-sm"> · {status.activity}</span>}
                </div>
                {verification && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold" style={{ background: `${verification.color}30`, color: verification.color }}>
                    <Shield className="h-4 w-4" />
                    {verification.label}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canEdit && (
                <Link
                  to={`/profile/${profile.uid}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
                  style={{ 
                    borderColor: theme.accentColor,
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor 
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Portfolio
                </Link>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${profile.displayName || profile.username}'s Portfolio`,
                      text: `Check out ${profile.displayName || profile.username}'s portfolio on BeastBuck!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
                style={{ 
                  borderColor: theme.accentColor,
                  background: `${theme.accentColor}20`,
                  color: theme.accentColor 
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
                style={{ 
                  borderColor: theme.accentColor,
                  background: `${theme.accentColor}20`,
                  color: theme.accentColor 
                }}
              >
                <Download className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-6 max-w-3xl text-lg opacity-90">{profile.bio}</p>
          )}
        </div>
      </section>

      {/* Privacy Panel - Only for own profile */}
      {showPrivacyPanel && isOwnProfile && (
        <div className="mx-auto max-w-6xl p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'showProjects', label: 'Show Projects' },
                { key: 'showResearch', label: 'Show Research Papers' },
                { key: 'showAchievements', label: 'Show Achievements' },
                { key: 'showStats', label: 'Show Statistics' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="font-bold text-white">{label}</span>
                  <button
                    onClick={() => handlePrivacyToggle(key, !privacy[key])}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${privacy[key] ? 'bg-accent' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${privacy[key] ? 'translate-x-5.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Content - Show all data to everyone */}
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        {/* Quick Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickInfoCard 
            icon={Briefcase}
            label="Role"
            value={profile?.role || 'Member'}
            theme={theme}
          />
          <QuickInfoCard 
            icon={GraduationCap}
            label="Level"
            value={`Level ${portfolioData?.stats?.level || 1}`}
            theme={theme}
          />
          <QuickInfoCard 
            icon={Star}
            label="Total XP"
            value={portfolioData?.stats?.totalXP || 0}
            theme={theme}
          />
          <QuickInfoCard 
            icon={Zap}
            label="Impact"
            value={portfolioData?.stats?.impact || 0}
            theme={theme}
          />
        </div>

        {/* Skills Section */}
        {portfolioData?.specializations?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Code className="h-5 w-5" style={{ color: theme.accentColor }} />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {portfolioData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`
                    }}
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={FolderKanban} 
            label="Projects" 
            value={portfolioData?.stats?.projects || 0}
            theme={theme}
          />
          <StatCard 
            icon={FlaskConical} 
            label="Research" 
            value={portfolioData?.stats?.research || 0}
            theme={theme}
          />
          <StatCard 
            icon={Award} 
            label="Achievements" 
            value={portfolioData?.stats?.achievements || 0}
            theme={theme}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Impact Score" 
            value={portfolioData?.stats?.impact || 0}
            theme={theme}
          />
        </div>

        {/* Projects Section */}
        {portfolioData?.projects?.length > 0 && (
          <PortfolioSection 
            title="Featured Projects" 
            icon={FolderKanban}
            items={portfolioData.projects}
            theme={theme}
          />
        )}

        {/* Research Section */}
        {portfolioData?.research?.length > 0 && (
          <PortfolioSection 
            title="Research Papers" 
            icon={FlaskConical}
            items={portfolioData.research}
            theme={theme}
          />
        )}

        {/* Achievements Section */}
        {portfolioData?.achievements?.length > 0 && (
          <PortfolioSection 
            title="Achievements" 
            icon={Award}
            items={portfolioData.achievements}
            theme={theme}
          />
        )}

        {/* Contact Section */}
        <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
              <Mail className="h-5 w-5" style={{ color: theme.accentColor }} />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile?.email && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <Mail className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.email}</span>
                </div>
              )}
              {profile?.phoneNumber && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <Phone className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <MapPin className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.location}</span>
                </div>
              )}
              {profile?.education && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.education}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education & Interests Section */}
        {(profile?.education || profile?.interests) && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
                Education & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.education && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Education</h3>
                  <p className="text-sm opacity-80" style={{ color: theme.textColor }}>{profile.education}</p>
                </div>
              )}
              {profile?.interests && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.split(',').map((interest, index) => (
                      <span 
                        key={index}
                        className="rounded-lg px-3 py-1 text-xs font-bold transition-all hover:scale-105"
                        style={{ 
                          background: `${theme.accentColor}20`,
                          color: theme.accentColor,
                          border: `1px solid ${theme.accentColor}40`
                        }}
                      >
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Custom Sections */}
        {profile?.customSections?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Sparkles className="h-5 w-5" style={{ color: theme.accentColor }} />
                Custom Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.customSections.map((section, index) => (
                <div 
                  key={index}
                  className="rounded-xl border p-4 transition-all hover:scale-[1.02]"
                  style={{ 
                    borderColor: `${theme.accentColor}30`,
                    background: `${theme.accentColor}10`
                  }}
                >
                  <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>
                    {section.title}
                  </h3>
                  <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        {portfolioData?.activity?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Activity className="h-5 w-5" style={{ color: theme.accentColor }} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolioData.activity.slice(0, 10).map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-all hover:scale-[1.01]"
                    style={{ 
                      borderColor: `${theme.accentColor}30`,
                      background: `${theme.accentColor}10`
                    }}
                  >
                    <div className="rounded-full p-2" style={{ background: `${theme.accentColor}20` }}>
                      <Activity className="h-4 w-4" style={{ color: theme.accentColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: theme.textColor }}>
                        {activity.action || activity.type || 'Activity'}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: theme.textColor }}>
                        {activity.timestamp?.toDate?.() 
                          ? new Date(activity.timestamp.toDate()).toLocaleDateString()
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, theme }) {
  return (
    <Card 
      className="transition-all duration-300 hover:scale-105"
      style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <div 
          className="rounded-xl p-3"
          style={{ background: `${theme.accentColor}20` }}
        >
          <Icon className="h-6 w-6" style={{ color: theme.accentColor }} />
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: theme.textColor }}>{value}</p>
          <p className="text-sm opacity-70" style={{ color: theme.textColor }}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickInfoCard({ icon: Icon, label, value, theme }) {
  return (
    <div 
      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-105"
      style={{ 
        borderColor: `${theme.accentColor}40`,
        background: theme.cardBg
      }}
    >
      <div 
        className="rounded-lg p-2"
        style={{ background: `${theme.accentColor}20` }}
      >
        <Icon className="h-5 w-5" style={{ color: theme.accentColor }} />
      </div>
      <div>
        <p className="text-xs opacity-70" style={{ color: theme.textColor }}>{label}</p>
        <p className="font-bold" style={{ color: theme.textColor }}>{value}</p>
      </div>
    </div>
  );
}

function PortfolioSection({ title, icon: Icon, items, theme }) {
  return (
    <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
          <Icon className="h-5 w-5" style={{ color: theme.accentColor }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className="overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: `${theme.accentColor}40`,
                background: `${theme.accentColor}10`
              }}
            >
              {/* Media Display */}
              {item.media && item.media.length > 0 && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  {item.media[0].type === 'video' ? (
                    <video 
                      src={item.media[0].url} 
                      controls
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <img 
                      src={item.media[0].url} 
                      alt={item.title}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </div>
              )}
              <h3 className="font-bold" style={{ color: theme.textColor }}>{item.title}</h3>
              <p className="mt-2 text-sm opacity-80" style={{ color: theme.textColor }}>{item.description}</p>
              {item.link && (
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold hover:underline"
                  style={{ color: theme.accentColor }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
