import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sparkles, Lightbulb, FileText, MessageSquare, Tag, Image as ImageIcon, Camera, Zap, Award, User, Wand2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AIMovieAssistant() {
  const { user } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    { id: 'ideas', name: 'Generate Movie Ideas', icon: Lightbulb, color: 'purple', description: 'Get creative movie concepts' },
    { id: 'scripts', name: 'Write Scripts', icon: FileText, color: 'cyan', description: 'Generate movie scripts' },
    { id: 'dialogues', name: 'Write Dialogues', icon: MessageSquare, color: 'emerald', description: 'Create character dialogues' },
    { id: 'comedy', name: 'Suggest Comedy', icon: Laugh, color: 'amber', description: 'Add humor to your content' },
    { id: 'titles', name: 'Generate Titles', icon: Sparkles, color: 'pink', description: 'Catchy movie titles' },
    { id: 'descriptions', name: 'Generate Descriptions', icon: FileText, color: 'red', description: 'Engaging descriptions' },
    { id: 'tags', name: 'Suggest Tags', icon: Tag, color: 'blue', description: 'Optimize discoverability' },
    { id: 'posters', name: 'Generate Posters', icon: ImageIcon, color: 'violet', description: 'AI-generated posters' },
    { id: 'thumbnails', name: 'Generate Thumbnails', icon: Camera, color: 'orange', description: 'Eye-catching thumbnails' },
    { id: 'storyboards', name: 'Create Storyboards', icon: Layout, color: 'teal', description: 'Visual story planning' },
    { id: 'improve', name: 'Improve Story', icon: Wand2, color: 'rose', description: 'Enhance your narrative' },
    { id: 'camera', name: 'Suggest Camera Angles', icon: Camera, color: 'indigo', description: 'Cinematic techniques' },
    { id: 'characters', name: 'Generate Character Ideas', icon: User, color: 'sky', description: 'Unique character concepts' },
    { id: 'endings', name: 'Create Ending Ideas', icon: Award, color: 'lime', description: 'Memorable conclusions' },
    { id: 'engagement', name: 'Improve Engagement', icon: Zap, color: 'fuchsia', description: 'Boost viewer retention' },
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
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
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
        title="AI Movie Assistant" 
        description="AI Director helping creators with ideas, scripts, dialogues, and more."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-text-muted text-sm mb-4">{feature.description}</p>
                <Button
                  onClick={() => setSelectedFeature(feature)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Use Feature
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
