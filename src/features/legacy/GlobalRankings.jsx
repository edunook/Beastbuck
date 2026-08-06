import React, { useState } from 'react';
import { Globe, TrendingUp, Search, Filter, ArrowUpDown, Users, Building, Beaker, Briefcase, MapPin, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const rankingCategories = [
  { id: 'Members', label: 'Members', icon: Users },
  { id: 'Teams', label: 'Teams', icon: Building },
  { id: 'Labs', label: 'Labs', icon: Beaker },
  { id: 'Departments', label: 'Departments', icon: Briefcase },
  { id: 'Ventures', label: 'Ventures', icon: TrendingUp },
  { id: 'Chapters', label: 'Chapters', icon: MapPin },
];

const MOCK_RANKINGS = {
  Members: [
    { rank: 1, name: 'Dr. Sarah Chen', entityType: 'Member', score: 245000, trend: '+15%', location: 'San Francisco, USA', avatar: 'SC' },
    { rank: 2, name: 'Marcus Webb', entityType: 'Member', score: 198000, trend: '+12%', location: 'London, UK', avatar: 'MW' },
    { rank: 3, name: 'Elena Rodriguez', entityType: 'Member', score: 178000, trend: '+8%', location: 'Madrid, Spain', avatar: 'ER' },
    { rank: 4, name: 'David Kim', entityType: 'Member', score: 165000, trend: '+5%', location: 'Seoul, South Korea', avatar: 'DK' },
    { rank: 5, name: 'Anita Patel', entityType: 'Member', score: 152000, trend: '+22%', location: 'Mumbai, India', avatar: 'AP' },
  ],
  Teams: [
    { rank: 1, name: 'Quantum Research Team', entityType: 'Team', score: 450000, trend: '+18%', location: 'Global', avatar: 'QR' },
    { rank: 2, name: 'AI Innovation Squad', entityType: 'Team', score: 380000, trend: '+14%', location: 'Global', avatar: 'AI' },
    { rank: 3, name: 'Sustainability Group', entityType: 'Team', score: 320000, trend: '+9%', location: 'Europe', avatar: 'SG' },
  ],
  Labs: [
    { rank: 1, name: 'Advanced AI Lab', entityType: 'Lab', score: 520000, trend: '+20%', location: 'San Francisco, USA', avatar: 'AA' },
    { rank: 2, name: 'Quantum Computing Lab', entityType: 'Lab', score: 410000, trend: '+15%', location: 'Boston, USA', avatar: 'QC' },
  ],
  Departments: [
    { rank: 1, name: 'Research Department', entityType: 'Department', score: 680000, trend: '+12%', location: 'Global', avatar: 'RD' },
    { rank: 2, name: 'Engineering Department', entityType: 'Department', score: 590000, trend: '+10%', location: 'Global', avatar: 'ED' },
  ],
  Ventures: [
    { rank: 1, name: 'NeuralTech Ventures', entityType: 'Venture', score: 750000, trend: '+25%', location: 'Silicon Valley, USA', avatar: 'NT' },
    { rank: 2, name: 'GreenEnergy Solutions', entityType: 'Venture', score: 620000, trend: '+18%', location: 'Berlin, Germany', avatar: 'GE' },
  ],
  Chapters: [
    { rank: 1, name: 'Tokyo Chapter', entityType: 'Chapter', score: 156000, trend: '+10%', location: 'Tokyo, Japan', avatar: 'TK' },
    { rank: 2, name: 'New York Chapter', entityType: 'Chapter', score: 124000, trend: '+8%', location: 'New York, USA', avatar: 'NY' },
    { rank: 3, name: 'London Chapter', entityType: 'Chapter', score: 89000, trend: '+6%', location: 'London, UK', avatar: 'LD' },
  ],
};

const SORT_OPTIONS = [
  { value: 'score-desc', label: 'Score (High to Low)' },
  { value: 'score-asc', label: 'Score (Low to High)' },
  { value: 'trend-desc', label: 'Trend (High to Low)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

export default function GlobalRankings() {
  const [activeCategory, setActiveCategory] = useState('Members');
  const [rankings, setRankings] = useState(MOCK_RANKINGS.Members);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score-desc');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      const categoryData = MOCK_RANKINGS[activeCategory] || [];
      setRankings(categoryData);
      setLoading(false);
    }, 300);
  }, [activeCategory]);

  const filteredAndSortedRankings = React.useMemo(() => {
    let filtered = rankings;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        case 'trend-desc':
          return parseFloat(b.trend) - parseFloat(a.trend);
        case 'trend-asc':
          return parseFloat(a.trend) - parseFloat(b.trend);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return b.score - a.score;
      }
    });

    // Re-assign ranks after sorting
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [rankings, searchQuery, sortBy]);

  const CategoryIcon = rankingCategories.find(c => c.id === activeCategory)?.icon || Globe;

  return (
    <PageContainer>
      <PageHeader 
        title="Global Rankings" 
        description="Comprehensive leaderboard of impact scores across the BeastBuck network."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(MOCK_RANKINGS).flat().length}
            </p>
            <p className="text-xs text-text-muted">Total Ranked Entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Top</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(MOCK_RANKINGS).flat().reduce((sum, item) => sum + item.score, 0).toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Total Impact Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Growth</span>
            </div>
            <p className="text-2xl font-bold text-white">+18%</p>
            <p className="text-xs text-text-muted">Average Trend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Categories</span>
            </div>
            <p className="text-2xl font-bold text-white">{rankingCategories.length}</p>
            <p className="text-xs text-text-muted">Ranking Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex overflow-x-auto gap-2 pb-2">
            {rankingCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={activeCategory === cat.id ? 'default' : 'secondary'}
                  onClick={() => setActiveCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rankings..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-accent" />
            {activeCategory} Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-text-muted text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium w-24 text-center">Rank</th>
                  <th className="px-4 py-3 font-medium">Entity Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-accent" onClick={() => setSortBy(sortBy.includes('score') ? (sortBy === 'score-desc' ? 'score-asc' : 'score-desc') : 'score-desc')}>
                    Impact Score <ArrowUpDown className="h-3 w-3 inline ml-1" />
                  </th>
                  <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-accent" onClick={() => setSortBy(sortBy.includes('trend') ? (sortBy === 'trend-desc' ? 'trend-asc' : 'trend-desc') : 'trend-desc')}>
                    30d Trend <ArrowUpDown className="h-3 w-3 inline ml-1" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-muted">Loading rankings...</td>
                  </tr>
                ) : filteredAndSortedRankings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-muted">No data available for {activeCategory}.</td>
                  </tr>
                ) : filteredAndSortedRankings.map((item) => (
                  <tr key={item.rank} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto text-lg",
                        item.rank === 1 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]" :
                        item.rank === 2 ? "bg-white/20 text-white border border-white/30" :
                        item.rank === 3 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" :
                        "bg-white/5 text-text-muted"
                      )}>
                        {item.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                          {item.avatar}
                        </div>
                        <div className="font-bold text-lg text-white group-hover:text-accent transition-colors">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-text-muted">
                        {item.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-sm">{item.location}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xl font-semibold text-white">{item.score.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={cn(
                        "inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium",
                        item.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        <TrendingUp className={cn("w-4 h-4", item.trend.startsWith('-') && "rotate-180")} />
                        <span>{item.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
