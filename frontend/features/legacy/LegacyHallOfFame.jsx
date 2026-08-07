import { useState } from 'react';
import { Trophy, Award, Crown, Star, Calendar, TrendingUp, Medal, Filter, Search } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

const LEGACY_MEMBERS = [
  { 
    id: 1, 
    name: 'Dr. Sarah Chen', 
    title: 'Pioneer of AI Research', 
    year: 2020, 
    achievements: ['Published 50+ research papers', 'Mentored 100+ students', 'Founded AI Research Lab'],
    totalXP: 250000,
    contributions: 342,
    impact: 'Revolutionary',
    avatar: 'SC'
  },
  { 
    id: 2, 
    name: 'Marcus Webb', 
    title: 'Community Builder Extraordinaire', 
    year: 2021, 
    achievements: ['Built 12 regional chapters', 'Organized 50+ events', '5000+ members recruited'],
    totalXP: 195000,
    contributions: 287,
    impact: 'Transformative',
    avatar: 'MW'
  },
  { 
    id: 3, 
    name: 'Elena Rodriguez', 
    title: 'Innovation Champion', 
    year: 2022, 
    achievements: ['Created 20+ patented inventions', 'Led 3 successful ventures', 'Generated $10M+ in value'],
    totalXP: 178000,
    contributions: 256,
    impact: 'Exceptional',
    avatar: 'ER'
  },
  { 
    id: 4, 
    name: 'David Kim', 
    title: 'Education Visionary', 
    year: 2022, 
    achievements: ['Developed 30+ courses', 'Trained 10,000+ students', 'Created learning framework'],
    totalXP: 165000,
    contributions: 234,
    impact: 'Significant',
    avatar: 'DK'
  },
  { 
    id: 5, 
    name: 'Anita Patel', 
    title: 'Global Connector', 
    year: 2023, 
    achievements: ['Connected 50+ organizations', 'Facilitated 100+ partnerships', 'Expanded to 15 countries'],
    totalXP: 152000,
    contributions: 198,
    impact: 'Outstanding',
    avatar: 'AP'
  },
];

const HISTORICAL_PROJECTS = [
  { id: 1, name: 'Quantum Computing Initiative', year: 2020, status: 'Completed', impact: 'Revolutionary', contributors: 45 },
  { id: 2, name: 'Global Education Network', year: 2021, status: 'Completed', impact: 'Transformative', contributors: 78 },
  { id: 3, name: 'AI Ethics Framework', year: 2022, status: 'Completed', impact: 'Exceptional', contributors: 32 },
  { id: 4, name: 'Sustainable Energy Hub', year: 2023, status: 'Ongoing', impact: 'Significant', contributors: 56 },
];

const IMPACT_LEVELS = ['All', 'Revolutionary', 'Transformative', 'Exceptional', 'Significant', 'Outstanding'];
const YEARS = ['All', '2023', '2022', '2021', '2020'];

export default function LegacyHallOfFame() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImpact, setSelectedImpact] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activeTab, setActiveTab] = useState('members');

  const filteredMembers = LEGACY_MEMBERS.filter(member => {
    const matchesSearch = searchQuery === '' || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImpact = selectedImpact === 'All' || member.impact === selectedImpact;
    const matchesYear = selectedYear === 'All' || member.year.toString() === selectedYear;
    return matchesSearch && matchesImpact && matchesYear;
  });

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'Revolutionary': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Transformative': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Exceptional': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Significant': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Outstanding': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default: return 'bg-white/10 text-text-muted border-border';
    }
  };

  const getImpactIcon = (impact) => {
    switch(impact) {
      case 'Revolutionary': return Crown;
      case 'Transformative': return Trophy;
      case 'Exceptional': return Star;
      case 'Significant': return Medal;
      case 'Outstanding': return Award;
      default: return Star;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Legacy Hall of Fame" 
        description="Honoring the exceptional contributors who have shaped the BeastBuck ecosystem through their dedication and achievements."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Crown className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Legendary</span>
            </div>
            <p className="text-2xl font-bold text-white">{LEGACY_MEMBERS.length}</p>
            <p className="text-xs text-text-muted">Hall of Fame Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Projects</span>
            </div>
            <p className="text-2xl font-bold text-white">{HISTORICAL_PROJECTS.length}</p>
            <p className="text-xs text-text-muted">Historical Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">XP</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {LEGACY_MEMBERS.reduce((sum, m) => sum + m.totalXP, 0).toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Total XP Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Contributions</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {LEGACY_MEMBERS.reduce((sum, m) => sum + m.contributions, 0)}
            </p>
            <p className="text-xs text-text-muted">Total Contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'members' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('members')}
        >
          Hall of Fame Members
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('projects')}
        >
          Historical Projects
        </Button>
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
                placeholder="Search members or projects..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <select 
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {IMPACT_LEVELS.map(level => (
                  <option key={level} value={level}>{level === 'All' ? 'All Impact Levels' : level}</option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {YEARS.map(year => (
                  <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === 'members' ? (
        /* Members Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const ImpactIcon = getImpactIcon(member.impact);
            return (
              <Card key={member.id} className="group hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ImpactIcon className="h-4 w-4 text-accent" />
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border", getImpactColor(member.impact))}>
                          {member.impact}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg">{member.name}</h3>
                      <p className="text-sm text-text-muted">{member.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Inducted</span>
                      <span className="text-white flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {member.year}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Total XP</span>
                      <span className="text-white font-bold">{member.totalXP.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Contributions</span>
                      <span className="text-white">{member.contributions}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-text-muted uppercase">Key Achievements</p>
                    {member.achievements.slice(0, 3).map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-text-soft">
                        <Star className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Historical Projects */
        <div className="grid gap-4">
          {HISTORICAL_PROJECTS.map((project) => {
            return (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl shrink-0">
                      <Trophy className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg">{project.name}</h3>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border", getImpactColor(project.impact))}>
                          {project.impact}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                        )}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {project.contributors} contributors
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredMembers.length === 0 && activeTab === 'members' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No members found</h3>
            <p className="text-text-muted text-sm">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
