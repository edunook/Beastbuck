import { useState } from 'react';
import { Award, Star, TrendingUp, Trophy, UserPlus, ChevronRight, Search, Filter, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const AMBASSADORS = [
  { id: 1, name: 'Elena Rodriguez', level: 'Global Ambassador', points: 12500, region: 'Europe', trend: '+15%', country: 'Spain', joined: '2023-06-15' },
  { id: 2, name: 'David Kim', level: 'Senior Ambassador', points: 9800, region: 'Asia-Pacific', trend: '+8%', country: 'South Korea', joined: '2023-08-22' },
  { id: 3, name: 'Sarah Jenkins', level: 'Regional Ambassador', points: 7200, region: 'North America', trend: '+12%', country: 'USA', joined: '2023-09-10' },
  { id: 4, name: 'Omar Hassan', level: 'Regional Ambassador', points: 6400, region: 'Middle East', trend: '+5%', country: 'UAE', joined: '2023-10-05' },
  { id: 5, name: 'Anita Patel', level: 'Senior Ambassador', points: 8900, region: 'South Asia', trend: '+22%', country: 'India', joined: '2023-07-18' },
  { id: 6, name: 'Marcus Weber', level: 'Regional Ambassador', points: 5800, region: 'Europe', trend: '+10%', country: 'Germany', joined: '2023-11-12' },
  { id: 7, name: 'Chloe Chen', level: 'Regional Ambassador', points: 5100, region: 'Asia-Pacific', trend: '+7%', country: 'Australia', joined: '2023-12-01' },
  { id: 8, name: 'Alex Rivera', level: 'Senior Ambassador', points: 8200, region: 'North America', trend: '+18%', country: 'Canada', joined: '2023-06-28' },
];

const LEVELS = [
  { title: 'Global Ambassador', req: '10,000+ pts', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { title: 'Senior Ambassador', req: '5,000+ pts', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { title: 'Regional Ambassador', req: '1,000+ pts', icon: Award, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

const REGIONS = ['All Regions', 'North America', 'Europe', 'Asia-Pacific', 'Middle East', 'South Asia', 'South America', 'Africa'];

export default function AmbassadorHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const filteredAmbassadors = AMBASSADORS.filter(amb => {
    const matchesSearch = searchQuery === '' || 
      amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || amb.region === selectedRegion;
    const matchesLevel = selectedLevel === 'All Levels' || amb.level === selectedLevel;
    return matchesSearch && matchesRegion && matchesLevel;
  }).sort((a, b) => b.points - a.points);

  const totalPoints = AMBASSADORS.reduce((sum, amb) => sum + amb.points, 0);
  const globalAmbassadors = AMBASSADORS.filter(amb => amb.level === 'Global Ambassador').length;

  return (
    <PageContainer>
      <PageHeader 
        title="Ambassador Hub" 
        description="Recognizing our top community builders globally. Climb the ranks and earn exclusive perks."
        action={
          <Button onClick={() => setShowApplyForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        }
      />

      {/* Level Requirements */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {LEVELS.map((lvl, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className={cn("p-3 rounded-xl", lvl.bg, lvl.color)}>
                <lvl.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{lvl.title}</h3>
                <p className="text-sm text-text-muted">Requires {lvl.req}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Elite</span>
            </div>
            <p className="text-2xl font-bold text-white">{globalAmbassadors}</p>
            <p className="text-xs text-text-muted">Global Ambassadors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Growing</span>
            </div>
            <p className="text-2xl font-bold text-white">{AMBASSADORS.length}</p>
            <p className="text-xs text-text-muted">Total Ambassadors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Points</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-text-muted">Total Points Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ambassadors by name or country..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="All Levels">All Levels</option>
                {LEVELS.map(lvl => (
                  <option key={lvl.title} value={lvl.title}>{lvl.title}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply Modal */}
      {showApplyForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Apply to Become an Ambassador</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowApplyForm(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Why do you want to become an ambassador?</label>
              <textarea
                placeholder="Describe your motivation..."
                rows={4}
                className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => alert('Application submitted! (Feature in development)')}>Submit Application</Button>
              <Button variant="ghost" onClick={() => setShowApplyForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-text-muted text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Ambassador</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium text-right">Points</th>
                  <th className="px-4 py-3 font-medium text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAmbassadors.map((amb, i) => (
                  <tr key={amb.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        i === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                        i === 1 ? "bg-white/20 text-white border border-white/30" :
                        i === 2 ? "bg-orange-600/20 text-orange-400 border border-orange-600/30" : "text-text-muted"
                      )}>
                        #{i + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white group-hover:text-accent transition-colors">{amb.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-text-muted">
                        {amb.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {amb.country}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-white">{amb.points.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        amb.trend.startsWith('+') ? "text-emerald-400" : "text-red-400"
                      )}>
                        {amb.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAmbassadors.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Award className="mx-auto h-8 w-8 mb-2" />
              <p>No ambassadors found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
