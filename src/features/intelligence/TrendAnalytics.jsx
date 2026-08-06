import { useState } from 'react';
import { LineChart, BarChart3, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const KEYWORD_TRENDS = [
  { keyword: 'AI/ML', popularity: 92, change: 15, category: 'Technology' },
  { keyword: 'Web3', popularity: 78, change: -5, category: 'Technology' },
  { keyword: 'Sustainability', popularity: 85, change: 22, category: 'Social' },
  { keyword: 'Remote Work', popularity: 71, change: 8, category: 'Work' },
  { keyword: 'Blockchain', popularity: 65, change: -12, category: 'Technology' },
  { keyword: 'Mental Health', popularity: 88, change: 18, category: 'Health' },
  { keyword: 'E-Learning', popularity: 94, change: 28, category: 'Education' },
  { keyword: 'Gig Economy', popularity: 62, change: 3, category: 'Work' },
];

const ACTIVITY_DATA = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 68 },
  { day: 'Thu', value: 85 },
  { day: 'Fri', value: 92 },
  { day: 'Sat', value: 78 },
  { day: 'Sun', value: 71 },
];

const CATEGORY_DATA = [
  { category: 'Technology', value: 45, color: 'bg-blue-500' },
  { category: 'Education', value: 32, color: 'bg-purple-500' },
  { category: 'Health', value: 18, color: 'bg-emerald-500' },
  { category: 'Work', value: 25, color: 'bg-amber-500' },
  { category: 'Social', value: 15, color: 'bg-pink-500' },
];

export default function TrendAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTrends = selectedCategory === 'all' 
    ? KEYWORD_TRENDS 
    : KEYWORD_TRENDS.filter(t => t.category === selectedCategory);

  const categories = ['all', ...new Set(KEYWORD_TRENDS.map(t => t.category))];

  return (
    <PageContainer>
      <PageHeader 
        title="Trend Analytics" 
        description="Track topic keywords popularity and ecosystem-wide trends."
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'secondary'}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-muted" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="1y">Year to Date</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-accent" />
            Platform Activity Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-3 px-4">
            {ACTIVITY_DATA.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className="w-full max-w-16 bg-gradient-to-t from-accent/20 to-accent rounded-t-sm transition-all duration-300 group-hover:brightness-125 cursor-pointer"
                    style={{ height: `${data.value}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.value}%
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted mt-2">{data.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Keyword Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Keyword Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTrends.map((trend, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{trend.keyword}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
                        {trend.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{trend.popularity}%</span>
                      {trend.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-xs ${trend.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend.change >= 0 ? '+' : ''}{trend.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${trend.popularity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-accent" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CATEGORY_DATA.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cat.category}</span>
                    <span className="text-sm text-text-muted">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${cat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{KEYWORD_TRENDS.length}</p>
                <p className="text-xs text-text-muted">Total Keywords</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {KEYWORD_TRENDS.filter(t => t.change > 0).length}
                </p>
                <p className="text-xs text-text-muted">Rising Trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
