import { useState } from 'react';
import { MapPin, Users, Activity, Plus, ArrowRight, Shield, Search, Globe, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const CHAPTERS = [
  { id: 1, location: 'New York, USA', leader: 'Sarah Jenkins', members: 1240, programs: 3, status: 'Active', region: 'North America', color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 2, location: 'London, UK', leader: 'James Holden', members: 890, programs: 2, status: 'Active', region: 'Europe', color: 'from-purple-500/20 to-pink-500/10' },
  { id: 3, location: 'Tokyo, Japan', leader: 'Yuki Tanaka', members: 1560, programs: 5, status: 'Active', region: 'Asia-Pacific', color: 'from-orange-500/20 to-red-500/10' },
  { id: 4, location: 'Berlin, Germany', leader: 'Marcus Weber', members: 620, programs: 1, status: 'Growing', region: 'Europe', color: 'from-green-500/20 to-emerald-500/10' },
  { id: 5, location: 'Sydney, AUS', leader: 'Chloe Chen', members: 430, programs: 2, status: 'Active', region: 'Asia-Pacific', color: 'from-blue-500/20 to-indigo-500/10' },
  { id: 6, location: 'Toronto, CAN', leader: 'Alex Rivera', members: 780, programs: 4, status: 'Active', region: 'North America', color: 'from-pink-500/20 to-rose-500/10' },
  { id: 7, location: 'Singapore', leader: 'Wei Lin', members: 920, programs: 3, status: 'Active', region: 'Asia-Pacific', color: 'from-teal-500/20 to-cyan-500/10' },
  { id: 8, location: 'Dubai, UAE', leader: 'Fatima Al-Rashid', members: 540, programs: 2, status: 'Growing', region: 'Middle East', color: 'from-amber-500/20 to-yellow-500/10' },
];

const REGIONS = ['All Regions', 'North America', 'Europe', 'Asia-Pacific', 'Middle East', 'South America', 'Africa'];

export default function ChaptersHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredChapters = CHAPTERS.filter(chapter => {
    const matchesSearch = searchQuery === '' || 
      chapter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.leader.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || chapter.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const totalMembers = CHAPTERS.reduce((sum, ch) => sum + ch.members, 0);
  const activeChapters = CHAPTERS.filter(ch => ch.status === 'Active').length;

  return (
    <PageContainer>
      <PageHeader 
        title="Chapters Hub" 
        description="Connect with local and regional BeastBuck chapters. Join a community near you or start your own."
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Start a Chapter
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Global</span>
            </div>
            <p className="text-2xl font-bold text-white">{CHAPTERS.length}</p>
            <p className="text-xs text-text-muted">Total Chapters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Growing</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalMembers.toLocaleString()}</p>
            <p className="text-xs text-text-muted">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeChapters}</p>
            <p className="text-xs text-text-muted">Active Chapters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Programs</span>
            </div>
            <p className="text-2xl font-bold text-white">{CHAPTERS.reduce((sum, ch) => sum + ch.programs, 0)}</p>
            <p className="text-xs text-text-muted">Active Programs</p>
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
                placeholder="Search chapters by location or leader..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Chapter Modal */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Start a New Chapter</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Chapter Location</label>
              <Input placeholder="City, Country" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Region</label>
              <select className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {REGIONS.filter(r => r !== 'All Regions').map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button>Submit Application</Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters.map((chapter) => (
          <Card key={chapter.id} className="group relative overflow-hidden">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", chapter.color)} />
            <CardContent className="relative z-10 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <span className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full border",
                  chapter.status === 'Active' 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                  {chapter.status}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">{chapter.location}</h3>
                <p className="text-sm text-text-muted flex items-center mt-1">
                  <Shield className="w-4 h-4 mr-1 opacity-70" /> Led by {chapter.leader}
                </p>
                <p className="text-xs text-text-muted mt-1">{chapter.region}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-text-muted mb-1">Members</p>
                  <p className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-blue-400" />
                    {chapter.members.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Active Programs</p>
                  <p className="text-lg font-semibold text-white flex items-center">
                    <Activity className="w-4 h-4 mr-1.5 text-pink-400" />
                    {chapter.programs}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="secondary" className="w-full">
                  View Chapter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No chapters found</h3>
            <p className="text-text-muted text-sm">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
