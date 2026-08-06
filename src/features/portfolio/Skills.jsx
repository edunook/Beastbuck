import { Code, Database, Brain, Palette, Server, Shield, MessageSquare, FileText, BriefcaseBusiness, Bot, Lock, TrendingUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function Skills() {
  const skills = [
    { id: 'react', name: 'React', level: 90, icon: Code, color: 'purple' },
    { id: 'firebase', name: 'Firebase', level: 85, icon: Database, color: 'cyan' },
    { id: 'ml', name: 'Machine Learning', level: 75, icon: Brain, color: 'emerald' },
    { id: 'ui', name: 'UI Design', level: 80, icon: Palette, color: 'amber' },
    { id: 'python', name: 'Python', level: 88, icon: Code, color: 'pink' },
    { id: 'java', name: 'Java', level: 72, icon: Code, color: 'red' },
    { id: 'nodejs', name: 'Node.js', level: 82, icon: Server, color: 'blue' },
    { id: 'leadership', name: 'Leadership', level: 78, icon: BriefcaseBusiness, color: 'violet' },
    { id: 'research', name: 'Research', level: 85, icon: FileText, color: 'orange' },
    { id: 'innovation', name: 'Innovation', level: 88, icon: TrendingUp, color: 'teal' },
    { id: 'ai', name: 'AI', level: 80, icon: Bot, color: 'rose' },
    { id: 'blockchain', name: 'Blockchain', level: 65, icon: Lock, color: 'indigo' },
    { id: 'cybersecurity', name: 'Cybersecurity', level: 70, icon: Shield, color: 'sky' },
    { id: 'communication', name: 'Communication', level: 85, icon: MessageSquare, color: 'lime' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Skills" 
        description="Auto-generated skills with progress bars, skill levels, and reordering capability for React, Firebase, Machine Learning, UI Design, Python, Java, Node.js, Leadership, Research, Innovation, AI, Blockchain, and Cybersecurity."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <Card key={skill.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getColorClass(skill.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{skill.name}</h3>
                    <p className="text-accent text-sm">{skill.level}%</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
