import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AIUsageAnalytics({ agentId }) {
  const [analytics, setAnalytics] = useState({
    totalChats: 0,
    totalUsers: 0,
    avgRating: 0,
    totalReviews: 0,
    activeCategories: [],
    usageOverTime: [],
  });

  useEffect(() => {
    // Mock data - in production, fetch from Firestore
    setAnalytics({
      totalChats: 15420,
      totalUsers: 2340,
      avgRating: 4.8,
      totalReviews: 234,
      activeCategories: [
        { name: 'Coding', count: 5200 },
        { name: 'Writing', count: 3800 },
        { name: 'Research', count: 3100 },
        { name: 'Creative', count: 2100 },
        { name: 'Business', count: 1220 },
      ],
      usageOverTime: [
        { date: 'Jan 1', chats: 120 },
        { date: 'Jan 2', chats: 145 },
        { date: 'Jan 3', chats: 132 },
        { date: 'Jan 4', chats: 168 },
        { date: 'Jan 5', chats: 189 },
        { date: 'Jan 6', chats: 210 },
        { date: 'Jan 7', chats: 234 },
      ],
    });
  }, [agentId]);

  const maxValue = Math.max(...analytics.usageOverTime.map(d => d.chats));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Total Chats</span>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.totalChats.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Unique Users</span>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <Star className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.avgRating.toFixed(1)}</p>
              <p className="text-xs text-text-muted">{analytics.totalReviews} reviews</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Growth</span>
              </div>
              <p className="text-2xl font-bold text-green-400">+24.5%</p>
              <p className="text-xs text-text-muted">Last 7 days</p>
            </div>
          </div>

          {/* Usage Over Time Chart */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Usage Over Time</h3>
            <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
              <div className="flex items-end gap-2 h-40">
                {analytics.usageOverTime.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-accent rounded-t transition-all hover:bg-accent/80"
                      style={{ height: `${(data.chats / maxValue) * 100}%` }}
                    />
                    <span className="text-[10px] text-text-muted">{data.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Active Categories</h3>
            <div className="space-y-2">
              {analytics.activeCategories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{category.name}</span>
                    <span className="text-text-muted">{category.count.toLocaleString()} chats</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${(category.count / analytics.totalChats) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            <div className="space-y-2">
              {[
                { user: 'user123', action: 'Started a chat', time: '2 min ago' },
                { user: 'dev_master', action: 'Left a 5-star review', time: '15 min ago' },
                { user: 'researcher_ai', action: 'Used the agent 5 times', time: '1 hour ago' },
                { user: 'creative_writer', action: 'Shared the agent', time: '2 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                      {activity.user[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white">{activity.user}</p>
                      <p className="text-xs text-text-muted">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
