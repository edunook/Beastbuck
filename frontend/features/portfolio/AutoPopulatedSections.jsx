import { FolderKanban, FileText, FlaskConical, ShoppingCart, Image, Film, Bot, Award, GraduationCap, Calendar, Rocket, TrendingUp, Trophy, GitCommit } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function AutoPopulatedSections() {
  const sections = [
    { id: 'projects', name: 'Projects', icon: FolderKanban, color: 'purple', count: 23, auto: true },
    { id: 'research', name: 'Research', icon: FileText, color: 'cyan', count: 12, auto: true },
    { id: 'experiments', name: 'Experiments', icon: FlaskConical, color: 'emerald', count: 8, auto: true },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingCart, color: 'amber', count: 15, auto: true },
    { id: 'showcase', name: 'Showcase', icon: Image, color: 'pink', count: 34, auto: true },
    { id: 'funflix', name: 'FunFlix', icon: Film, color: 'red', count: 7, auto: true },
    { id: 'ai-studio', name: 'AI Studio', icon: Bot, color: 'blue', count: 5, auto: true },
    { id: 'achievements', name: 'Achievements', icon: Award, color: 'violet', count: 45, auto: true },
    { id: 'certificates', name: 'Certificates', icon: GraduationCap, color: 'orange', count: 12, auto: true },
    { id: 'timeline', name: 'Timeline', icon: Calendar, color: 'teal', count: 67, auto: true },
    { id: 'events', name: 'Events', icon: Calendar, color: 'rose', count: 45, auto: true },
    { id: 'ventures', name: 'Ventures', icon: Rocket, color: 'indigo', count: 3, auto: true },
    { id: 'leaderboards', name: 'Leaderboards', icon: Trophy, color: 'sky', count: 8, auto: true },
    { id: 'contributions', name: 'Contributions', icon: GitCommit, color: 'lime', count: 156, auto: true },
    { id: 'skills', name: 'Skills', icon: TrendingUp, color: 'fuchsia', count: 14, auto: true },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 border-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      lime: 'bg-lime-500/20 border-lime-500/30 text-lime-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Auto-Populated Sections" 
        description="Automatic population for projects, research, experiments, marketplace, showcase, FunFlix, AI Studio, achievements, certificates, timeline, events, ventures, leaderboards, contributions, and skills based on activity."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(section.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{section.name}</h3>
                  {section.auto && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-accent font-bold">{section.count} Items</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
