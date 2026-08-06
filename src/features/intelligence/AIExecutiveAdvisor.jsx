import { useState } from 'react';
import { Bot, Send, User, Sparkles, BarChart2, ShieldAlert, TrendingUp, Activity, Database, Zap } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const SYSTEM_STATS = {
  performance: { score: 87, trend: '+5%', status: 'healthy' },
  userGrowth: { score: 92, trend: '+12%', status: 'excellent' },
  engagement: { score: 78, trend: '-3%', status: 'good' },
  revenue: { score: 85, trend: '+8%', status: 'healthy' },
};

const RECOMMENDATIONS = [
  { id: 1, type: 'opportunity', title: 'AI Course Surge', description: 'E-Learning keyword up 28%. Consider expanding AI course offerings.', priority: 'high' },
  { id: 2, type: 'warning', title: 'Engagement Dip', description: 'User engagement down 3%. Review recent UI changes.', priority: 'medium' },
  { id: 3, type: 'success', title: 'Revenue Growth', description: 'Revenue up 8% this quarter. Maintain current strategy.', priority: 'low' },
];

export default function AIExecutiveAdvisor() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Greetings, Executive. I am your Strategic AI Advisor. I can analyze system telemetry, identify trends, and provide actionable recommendations. How may I assist you today?'
    }
  ]);

  const quickActions = [
    { label: "Analyze Performance", icon: BarChart2, color: "text-blue-400", query: "Analyze current system performance metrics" },
    { label: "Growth Predictions", icon: TrendingUp, color: "text-emerald-400", query: "Provide growth predictions for next quarter" },
    { label: "Risk Analysis", icon: ShieldAlert, color: "text-red-400", query: "Identify potential risks and mitigation strategies" },
    { label: "System Health", icon: Activity, color: "text-purple-400", query: "What is the current system health status?" },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate AI response based on query
    setTimeout(() => {
      let response = '';
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('performance') || lowerInput.includes('metrics')) {
        response = `Based on current telemetry:\n\n• Performance Score: 87% (trending +5%)\n• User Growth: 92% (trending +12%)\n• Engagement: 78% (trending -3%)\n• Revenue: 85% (trending +8%)\n\nOverall system health is healthy. I recommend focusing on the engagement dip by reviewing recent UI changes and gathering user feedback.`;
      } else if (lowerInput.includes('growth') || lowerInput.includes('predict')) {
        response = `Growth Analysis:\n\n• User Growth: Excellent (+12%)\n• Revenue: Healthy (+8%)\n• Engagement: Good (-3%)\n\nPrediction: Based on current trends, we project 15-20% growth in Q4 if engagement stabilizes. The AI course surge presents a significant opportunity for expansion.`;
      } else if (lowerInput.includes('risk') || lowerInput.includes('mitigation')) {
        response = `Risk Assessment:\n\n• High Risk: Engagement decline (-3%)\n• Medium Risk: Web3 keyword trending down (-12%)\n• Low Risk: System performance stable\n\nMitigation Strategies:\n1. Conduct user survey on engagement\n2. A/B test UI improvements\n3. Monitor Web3 trends for pivot opportunities`;
      } else if (lowerInput.includes('health') || lowerInput.includes('status')) {
        response = `System Health Status: HEALTHY\n\nAll core systems operational:\n• API Latency: 45ms (Good)\n• Database: 234 ops/min (Good)\n• Error Rate: 0.02% (Excellent)\n• Uptime: 99.9% (Excellent)\n\nNo critical issues detected. System is performing within normal parameters.`;
      } else {
        response = `I've analyzed your request. Based on current system data, I recommend focusing on the engagement metrics which have shown a slight decline. The AI course sector shows strong growth potential and could be prioritized for resource allocation.\n\nWould you like me to provide a detailed analysis of any specific metric?`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
      setLoading(false);
    }, 1500);
  };

  const handleQuickAction = (query) => {
    setInput(query);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Executive Advisor" 
        description="Strategic insights, system analysis, and decision support powered by AI."
      />

      {/* System Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Object.entries(SYSTEM_STATS).map(([key, stat]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {key === 'performance' && <Activity className="h-4 w-4 text-accent" />}
                {key === 'userGrowth' && <TrendingUp className="h-4 w-4 text-accent" />}
                {key === 'engagement' && <Sparkles className="h-4 w-4 text-accent" />}
                {key === 'revenue' && <Zap className="h-4 w-4 text-accent" />}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  stat.status === 'excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                  stat.status === 'healthy' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {stat.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.score}%</p>
              <p className="text-xs text-text-muted">{stat.trend} this period</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Chat Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" />
                Strategic Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="secondary"
                    onClick={() => handleQuickAction(action.query)}
                    className="whitespace-nowrap"
                  >
                    <action.icon className={`h-4 w-4 mr-2 ${action.color}`} />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto space-y-4 mb-4 p-4 bg-white/[0.02] rounded-xl">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant' ? 'bg-accent/20 text-accent' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.role === 'assistant' 
                        ? 'bg-white/5 border border-border rounded-tl-none' 
                        : 'bg-accent/20 border border-accent/30 rounded-tr-none'
                    }`}>
                      <p className="text-sm text-white whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/20 text-accent">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/5 border border-border rounded-2xl rounded-tl-none p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about system performance, risks, or predictions..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECOMMENDATIONS.map((rec) => (
                  <div key={rec.id} className={`p-3 rounded-lg border ${
                    rec.type === 'opportunity' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-text-muted">{rec.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm mb-1">{rec.title}</p>
                    <p className="text-xs text-text-muted">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-accent" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Connections</span>
                  <span className="text-white">12/20</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Query Time</span>
                  <span className="text-emerald-400">23ms avg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Cache Hit Rate</span>
                  <span className="text-emerald-400">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
