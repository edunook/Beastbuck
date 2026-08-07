import { CheckCircle, FolderKanban, FileText, Award, ShoppingCart, Film, Bot, Trophy, GraduationCap } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function Timeline() {
  const events = [
    { id: 1, date: '2023-07-15', title: 'Received Award', type: 'Achievement', icon: Trophy, color: 'amber' },
    { id: 2, date: '2023-06-20', title: 'Uploaded FunFlix Movie', type: 'FunFlix', icon: Film, color: 'red' },
    { id: 3, date: '2023-05-10', title: 'Created AI', type: 'AI Studio', icon: Bot, color: 'blue' },
    { id: 4, date: '2023-04-05', title: 'Released Product', type: 'Marketplace', icon: ShoppingCart, color: 'pink' },
    { id: 5, date: '2023-03-15', title: 'Uploaded Showcase', type: 'Showcase', icon: Image, color: 'violet' },
    { id: 6, date: '2023-02-20', title: 'Won Hackathon', type: 'Event', icon: Award, color: 'emerald' },
    { id: 7, date: '2023-01-10', title: 'Created Project', type: 'Project', icon: FolderKanban, color: 'purple' },
    { id: 8, date: '2022-12-05', title: 'Published Research', type: 'Research', icon: FileText, color: 'cyan' },
    { id: 9, date: '2022-11-15', title: 'Completed Course', type: 'Learning', icon: GraduationCap, color: 'orange' },
    { id: 10, date: '2022-10-01', title: 'Joined BeastBuck', type: 'Milestone', icon: CheckCircle, color: 'teal' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Timeline" 
        description="Automatic timeline showing joined BeastBuck, completed course, published research, created project, won hackathon, uploaded showcase, released product, created AI, uploaded FunFlix movie, and received award."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-xl ${getColorClass(event.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-text-muted text-sm">{event.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getColorClass(event.color)}`}>
                        {event.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-white">{event.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
