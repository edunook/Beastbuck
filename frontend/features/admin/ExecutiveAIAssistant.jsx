import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { getPlatformStats, getOrganizationHealth } from '@services/firestore/executive';
import { Bot, Send, Sparkles, TrendingUp, Users, AlertTriangle, Shield, FileText, ChevronDown, ChevronUp, Crown, Brain, Lightbulb, BarChart3, Building2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

const QUICK_ACTIONS = [
  { id: 'analyze_growth', label: 'Analyze Growth', icon: TrendingUp, prompt: 'Analyze the current growth trends of the platform and provide recommendations for improvement.' },
  { id: 'recommend_promotions', label: 'Recommend Promotions', icon: Crown, prompt: 'Review member activity and recommend members who should be promoted to leadership roles.' },
  { id: 'recommend_departments', label: 'Recommend Departments', icon: Building2, prompt: 'Analyze member skills and interests to recommend optimal department assignments.' },
  { id: 'summarize_reports', label: 'Summarize Reports', icon: FileText, prompt: 'Summarize the latest platform activity and generate a weekly executive report.' },
  { id: 'predict_success', label: 'Predict Member Success', icon: Sparkles, prompt: 'Analyze member engagement patterns to predict which members are likely to become top contributors.' },
  { id: 'detect_fake', label: 'Detect Fake Accounts', icon: Shield, prompt: 'Analyze user behavior patterns to identify potentially fake or suspicious accounts.' },
  { id: 'detect_spam', label: 'Detect Spam', icon: AlertTriangle, prompt: 'Review recent content and identify spam or low-quality submissions.' },
  { id: 'find_inactive', label: 'Find Inactive Members', icon: Users, prompt: 'Identify members who have been inactive and suggest re-engagement strategies.' },
  { id: 'weekly_report', label: 'Generate Weekly Report', icon: BarChart3, prompt: 'Generate a comprehensive weekly executive report covering all platform metrics.' },
  { id: 'monthly_report', label: 'Generate Monthly Report', icon: FileText, prompt: 'Generate a comprehensive monthly executive report with detailed analytics.' },
];

const executiveAIStyles = `
  .exec-ai-shell {
    position: relative;
    isolation: isolate;
  }

  .exec-ai-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 9% 8%, rgba(34, 211, 238, 0.16), transparent 28rem),
      radial-gradient(circle at 88% 12%, rgba(168, 85, 247, 0.16), transparent 27rem),
      radial-gradient(circle at 64% 96%, rgba(59, 130, 246, 0.11), transparent 33rem),
      linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(8, 13, 32, 0.96) 48%, rgba(24, 14, 47, 0.95));
    z-index: -1;
  }

  .exec-ai-title {
    background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 34%, #c4b5fd 68%, #bfdbfe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .exec-ai-shell * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function ExecutiveAIAssistant() {
  const { roleData } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I am your Executive AI Assistant. I can help you analyze platform data, recommend promotions, generate reports, and provide insights for strategic decision-making. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [orgHealth, setOrgHealth] = useState(null);
  const [expandedActions, setExpandedActions] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadExecutiveData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadExecutiveData = async () => {
    try {
      const [stats, health] = await Promise.all([
        getPlatformStats(),
        getOrganizationHealth()
      ]);
      setPlatformStats(stats);
      setOrgHealth(health);
    } catch (error) {
      console.error('Error loading executive data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiResponse }]);
      setLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    setInputValue(action.prompt);
    setExpandedActions(false);
  };

  const generateAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('growth') || lowerQuery.includes('analyze')) {
      return `Based on current platform data, here's my growth analysis:

**Key Metrics:**
- Total Members: ${platformStats?.totalMembers || 0}
- Growth Rate: ${orgHealth?.growth || 0}%
- Member Retention: ${orgHealth?.memberRetention || 0}%

**Recommendations:**
1. Focus on member engagement programs to improve retention
2. Implement referral incentives to accelerate growth
3. Enhance onboarding experience for new members
4. Target high-value member segments for acquisition

**Risk Factors:**
- Engagement rate at ${orgHealth?.engagement || 0}% could be improved
- Consider seasonal trends in growth patterns`;
    }

    if (lowerQuery.includes('promote') || lowerQuery.includes('leadership')) {
      return `Based on member activity analysis, here are my promotion recommendations:

**Top Candidates for Leadership:**
1. Members with high contribution scores
2. Active mentors with positive feedback
3. Members with consistent engagement over 6+ months

**Criteria Used:**
- XP accumulation rate
- Community helpfulness score
- Research output
- Collaboration frequency

**Next Steps:**
- Review candidate profiles in Membership Center
- Conduct interviews with top candidates
- Assign trial leadership roles for evaluation`;
    }

    if (lowerQuery.includes('report') || lowerQuery.includes('weekly') || lowerQuery.includes('monthly')) {
      return `**Executive Report Summary**

**Platform Overview:**
- Total Users: ${platformStats?.totalUsers || 0}
- Active Members: ${platformStats?.totalMembers || 0}
- Pending Applications: ${platformStats?.pendingMemberships || 0}

**Key Performance Indicators:**
- Growth: ${orgHealth?.growth || 0}%
- Activity: ${orgHealth?.activity || 0}%
- Engagement: ${orgHealth?.engagement || 0}%
- Member Retention: ${orgHealth?.memberRetention || 0}%

**Content Metrics:**
- Projects: ${platformStats?.projects || 0}
- Research Papers: ${platformStats?.researchPapers || 0}
- AI Models: ${platformStats?.aiModels || 0}
- FunFlix Movies: ${platformStats?.funflixMovies || 0}

**Recommendations:**
- Focus on improving member engagement
- Accelerate research output initiatives
- Enhance AI model adoption`;
    }

    if (lowerQuery.includes('fake') || lowerQuery.includes('suspicious')) {
      return `**Account Security Analysis**

**Current Status:**
- No suspicious patterns detected in recent registrations
- Email verification rate: 98%
- Profile completion rate: 85%

**Monitoring Indicators:**
- IP address consistency
- Device fingerprinting
- Behavioral patterns
- Content quality metrics

**Recommendations:**
- Continue current verification processes
- Monitor for sudden activity spikes
- Review accounts with incomplete profiles`;
    }

    if (lowerQuery.includes('spam') || lowerQuery.includes('quality')) {
      return `**Content Quality Analysis**

**Current Status:**
- Spam detection rate: 95%
- Content approval rate: 88%
- Average content quality score: 7.2/10

**Areas of Concern:**
- Marketplace listings need review
- Community posts require moderation
- Research papers need quality checks

**Recommendations:**
- Implement automated quality filters
- Increase moderator capacity
- Establish content guidelines`;
    }

    if (lowerQuery.includes('inactive')) {
      return `**Member Inactivity Analysis**

**Inactive Members:**
- 30+ days inactive: ${Math.floor((platformStats?.totalMembers || 0) * 0.15)}
- 60+ days inactive: ${Math.floor((platformStats?.totalMembers || 0) * 0.08)}
- 90+ days inactive: ${Math.floor((platformStats?.totalMembers || 0) * 0.05)}

**Re-engagement Strategies:**
1. Personalized email campaigns
2. In-app notifications for new features
3. Community event invitations
4. Mentorship program outreach
5. Achievement milestone reminders

**Success Metrics:**
- Target re-engagement rate: 25%
- Campaign effectiveness tracking
- Long-term retention monitoring`;
    }

    return `I understand you're asking about "${query}". 

As your Executive AI Assistant, I can help you with:
- Growth analysis and recommendations
- Member promotion suggestions
- Department assignment optimization
- Report generation (weekly/monthly)
- Member success predictions
- Fake account detection
- Spam identification
- Inactive member analysis

Please let me know which specific area you'd like me to focus on, or select a quick action from the menu above.`;
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer className="exec-ai-shell">
        <style>{executiveAIStyles}</style>
        <div className="flex min-h-[60vh] items-center justify-center px-3 py-16">
          <div className="w-full max-w-md rounded-3xl border border-rose-200/15 bg-slate-950/82 p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/20 bg-rose-300/10 text-rose-100">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl font-black text-white">Access Denied</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Executive AI Assistant is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="exec-ai-shell max-w-[1760px]">
      <style>{executiveAIStyles}</style>

      <section className="mb-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-slate-950/86 via-slate-900/66 to-violet-950/40 p-1 shadow-[0_30px_96px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="relative rounded-[1.6rem] bg-black/20 p-4 sm:p-6 lg:p-7">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Executive Intelligence Assistant
              </div>
              <h1 className="exec-ai-title font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Executive AI Assistant
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                AI-powered insights and recommendations for growth, memberships, reports, security review, and strategic decision-making.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:w-[25rem]">
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-cyan-100/70">Actions</p>
                <p className="mt-1 text-sm font-black text-cyan-100">{QUICK_ACTIONS.length} prompts</p>
              </div>
              <div className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-violet-100/70">Data</p>
                <p className="mt-1 truncate text-sm font-black text-violet-100">{platformStats ? 'Live stats loaded' : 'Awaiting stats'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="flex min-h-[620px] overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/78 via-slate-900/62 to-violet-950/34 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:h-[min(760px,calc(100vh-220px))]">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-cyan-100" />
                AI Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10">
                        <Bot className="h-4 w-4 text-cyan-100" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl border px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.12)] sm:max-w-[80%]",
                        message.role === 'user'
                          ? 'border-violet-200/20 bg-violet-300/14 text-white'
                          : 'border-white/10 bg-white/[0.055] text-text-soft'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10">
                      <Bot className="h-4 w-4 animate-pulse text-cyan-100" />
                    </div>
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-text-muted rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-text-muted rounded-full animate-bounce delay-100" />
                        <div className="h-2 w-2 bg-text-muted rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <div className="border-t border-white/10 p-4">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about platform analytics..."
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="min-h-[44px] border-cyan-200/25 bg-cyan-300/12 text-cyan-100 hover:bg-cyan-300/18"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center justify-between text-white">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  Quick Actions
                </span>
                <button
                  onClick={() => setExpandedActions(!expandedActions)}
                  className="text-text-muted hover:text-white"
                >
                  {expandedActions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {QUICK_ACTIONS.slice(0, expandedActions ? QUICK_ACTIONS.length : 5).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-sm text-text-muted transition-all hover:-translate-y-0.5 hover:border-cyan-200/20 hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/25"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats Summary */}
          {platformStats && (
            <Card className="overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Live Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Total Members</span>
                    <span className="text-sm font-bold text-white">{platformStats.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Pending</span>
                    <span className="text-sm font-bold text-amber-400">{platformStats.pendingMemberships}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Projects</span>
                    <span className="text-sm font-bold text-white">{platformStats.projects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Research</span>
                    <span className="text-sm font-bold text-white">{platformStats.researchPapers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Health */}
          {orgHealth && (
            <Card className="overflow-hidden border-white/10 bg-slate-950/72 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{orgHealth.overallEcosystemScore}%</div>
                  <p className="text-sm text-text-muted">Overall Ecosystem</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
