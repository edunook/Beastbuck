import { useState, useEffect } from 'react';
import { BarChart3, Eye, Download, Bookmark, Heart, MessageSquare, Share2, Clock, Globe } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ResearchAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Simulated analytics data
    setAnalytics({
      views: 1234,
      downloads: 456,
      bookmarks: 78,
      likes: 234,
      comments: 89,
      citations: 12,
      shares: 45,
      avgReadingTime: 4.5,
      completionRate: 78,
      aiExplanationUsage: 156,
      countriesReached: 23,
    });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Analytics" 
        description="Track your research performance and reach."
        hero={true}
      />

      {analytics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <span className="text-text-muted text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.views}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-5 w-5 text-cyan-400" />
                  <span className="text-text-muted text-sm">Downloads</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.downloads}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Bookmark className="h-5 w-5 text-amber-400" />
                  <span className="text-text-muted text-sm">Bookmarks</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.bookmarks}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span className="text-text-muted text-sm">Likes</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.likes}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    <span className="text-white">Comments</span>
                  </div>
                  <span className="font-bold text-accent">{analytics.comments}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-white">Shares</span>
                  </div>
                  <span className="font-bold text-emerald-400">{analytics.shares}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    <span className="text-white">Citations</span>
                  </div>
                  <span className="font-bold text-purple-400">{analytics.citations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reading Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <span className="text-white">Avg Reading Time</span>
                  </div>
                  <span className="font-bold text-amber-400">{analytics.avgReadingTime} min</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    <span className="text-white">Completion Rate</span>
                  </div>
                  <span className="font-bold text-cyan-400">{analytics.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    <span className="text-white">AI Explanation Usage</span>
                  </div>
                  <span className="font-bold text-purple-400">{analytics.aiExplanationUsage}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                <Globe className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-accent">{analytics.countriesReached}</p>
                  <p className="text-text-muted text-sm">Countries Reached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Loading analytics...</p>
        </div>
      )}
    </PageContainer>
  );
}
