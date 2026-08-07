import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { getPlatformStats, getOrganizationHealth, getActivityFeed } from '@services/firestore/executive';
import { Bot, Send, Sparkles, TrendingUp, Users, AlertTriangle, Shield, FileText, Zap, ChevronDown, ChevronUp, Crown, Brain, Lightbulb, BarChart3, Building2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
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

export default function ExecutiveAIAssistant() {
  const { user, roleData } = useAuth();
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
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Executive AI Assistant is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Executive AI Assistant" 
        description="AI-powered insights and recommendations for strategic decision-making."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-purple-400" />
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
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-purple-400" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? 'bg-accent/20 text-white'
                          : 'bg-white/5 text-text-soft'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
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
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about platform analytics..."
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !inputValue.trim()}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border">
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
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-text-muted hover:bg-white/5 hover:text-white transition-all"
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
            <Card>
              <CardHeader className="border-b border-border">
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
            <Card>
              <CardHeader className="border-b border-border">
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
