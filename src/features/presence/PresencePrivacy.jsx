import { useState } from 'react';
import { Shield, Globe, Users, UserX } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PresencePrivacy() {
  const [privacyLevel, setPrivacyLevel] = useState('everyone');

  const privacyLevels = [
    { id: 'everyone', name: 'Everyone', icon: Globe, color: 'blue', description: 'Anyone can see your presence' },
    { id: 'members', name: 'Members Only', icon: Users, color: 'emerald', description: 'Only members can see your presence' },
    { id: 'friends', name: 'Friends Only', icon: UserX, color: 'purple', description: 'Only friends can see your presence (Coming Soon)' },
    { id: 'nobody', name: 'Nobody', icon: Shield, color: 'red', description: 'Hide presence from everyone' },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Presence Privacy" 
        description="Privacy controls including Everyone, Members Only, Friends Only (future), and Nobody."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Who Can See Your Presence</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {privacyLevels.map((level) => {
              const Icon = level.icon;
              return (
                <button
                  key={level.id}
                  onClick={() => setPrivacyLevel(level.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    privacyLevel === level.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${getColorClass(level.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{level.name}</h4>
                  <p className="text-text-muted text-sm">{level.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Privacy Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Control who sees your online status</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Hide last seen time</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Disable rich presence</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Per-section privacy controls</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Privacy Settings
      </Button>
    </PageContainer>
  );
}
