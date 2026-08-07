import { useState } from 'react';
import { User, Target, Eye, Heart, BriefcaseBusiness, FlaskConical, Rocket } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AboutSection() {
  const [isEditing, setIsEditing] = useState(false);

  const sections = [
    { id: 'intro', name: 'Introduction', icon: User, color: 'purple', content: 'Passionate developer and researcher dedicated to creating innovative solutions.' },
    { id: 'mission', name: 'Mission', icon: Target, color: 'cyan', content: 'To build technology that empowers people and solves real-world problems.' },
    { id: 'vision', name: 'Vision', icon: Eye, color: 'emerald', content: 'A world where technology is accessible, ethical, and beneficial for everyone.' },
    { id: 'interests', name: 'Interests', icon: Heart, color: 'amber', content: 'AI, Machine Learning, Web Development, Research, Innovation.' },
    { id: 'goals', name: 'Career Goals', icon: BriefcaseBusiness, color: 'pink', content: 'Lead innovative projects, mentor others, and contribute to open-source.' },
    { id: 'research', name: 'Research Interests', icon: FlaskConical, color: 'red', content: 'Natural Language Processing, Computer Vision, Human-Computer Interaction.' },
    { id: 'future', name: 'Future Plans', icon: Rocket, color: 'blue', content: 'Launch a startup, publish research, and build a community of innovators.' },
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
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="About Section" 
        description="Rich about section with markdown support for introduction, mission, vision, interests, career goals, research interests, and future plans."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save Changes' : 'Edit About'}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="hover:border-accent/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getColorClass(section.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {section.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <textarea
                    defaultValue={section.content}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent min-h-[100px]"
                  />
                ) : (
                  <p className="text-text-muted">{section.content}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
