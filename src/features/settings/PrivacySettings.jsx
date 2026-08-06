import { Shield, Eye, MessageSquare, UserPlus, FileText, AtSign, Users, Hand, MessageCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PrivacySettings() {

  const privacySettings = {
    viewProfile: 'Everyone',
    sendMessage: 'Everyone',
    follow: 'Everyone',
    viewPortfolio: 'Everyone',
    seeActivity: 'Members Only',
    mention: 'Everyone',
    invite: 'Members Only',
    comment: 'Everyone',
    collaborate: 'Members Only',
  };

  const visibilityOptions = ['Everyone', 'Members Only', 'Friends Only', 'Nobody'];

  const getIcon = (key) => {
    const icons = {
      viewProfile: Eye,
      sendMessage: MessageSquare,
      follow: UserPlus,
      viewPortfolio: FileText,
      seeActivity: Eye,
      mention: AtSign,
      invite: Users,
      comment: MessageCircle,
      collaborate: Hand,
    };
    return icons[key] || Shield;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Privacy Settings" 
        description="Privacy controls including who can view profile, send messages, follow, view portfolio, see activity, mention, invite, comment, and collaborate."
        hero={true}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(privacySettings).map(([key, value]) => {
              const Icon = getIcon(key);
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-text-muted" />
                    <span className="text-white">{label}</span>
                  </div>
                  <select
                    defaultValue={value}
                    className="bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option} value={option.toLowerCase().replace(' ', '')}>{option}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Per-Section Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-text-muted mb-4">
            Set custom privacy for specific sections of your profile
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Projects</span>
              <select className="bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
                <option>Public</option>
                <option>Members Only</option>
                <option>Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Research</span>
              <select className="bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
                <option>Public</option>
                <option>Members Only</option>
                <option>Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Contact</span>
              <select className="bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
                <option>Public</option>
                <option>Members Only</option>
                <option>Private</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Changes
      </Button>
    </PageContainer>
  );
}
