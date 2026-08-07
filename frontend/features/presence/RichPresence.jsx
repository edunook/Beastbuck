import { useState } from 'react';
import { Layout, Film, FileText, User, Bot, ShoppingCart, MessageSquare, Calendar, Building, Compass, BookOpen, Edit3 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function RichPresence() {
  const [currentActivity, setCurrentActivity] = useState('browsing-dashboard');
  const [customMessage, setCustomMessage] = useState('');
  const [richPresenceEnabled, setRichPresenceEnabled] = useState(true);

  const activities = [
    { id: 'browsing-dashboard', name: 'Browsing Dashboard', icon: Layout, color: 'purple' },
    { id: 'watching-funflix', name: 'Watching FunFlix', icon: Film, color: 'rose' },
    { id: 'working-research', name: 'Working on Research', icon: FileText, color: 'emerald' },
    { id: 'editing-portfolio', name: 'Editing Portfolio', icon: User, color: 'cyan' },
    { id: 'building-ai', name: 'Building AI', icon: Bot, color: 'violet' },
    { id: 'marketplace-listing', name: 'Creating Marketplace Listing', icon: ShoppingCart, color: 'orange' },
    { id: 'chatting', name: 'Chatting', icon: MessageSquare, color: 'blue' },
    { id: 'attending-event', name: 'Attending Event', icon: Calendar, color: 'pink' },
    { id: 'working-organization', name: 'Working in Organization', icon: Building, color: 'amber' },
    { id: 'exploring-discover', name: 'Exploring Discover', icon: Compass, color: 'teal' },
    { id: 'studying-academy', name: 'Studying Academy', icon: BookOpen, color: 'sky' },
    { id: 'custom', name: 'Custom Status Message', icon: Edit3, color: 'gray' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Rich Presence" 
        description="Activity tracking including Browsing Dashboard, Watching FunFlix, Working on Research, Editing Portfolio, Building AI, Creating Marketplace Listing, Chatting, Attending Event, Working in Organization, Exploring Discover, Studying Academy, and Custom Status Message with disable option."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Rich Presence</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">Enable Rich Presence</span>
              <button
                onClick={() => setRichPresenceEnabled(!richPresenceEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${richPresenceEnabled ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${richPresenceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <button
                  key={activity.id}
                  onClick={() => setCurrentActivity(activity.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    currentActivity === activity.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${getColorClass(activity.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{activity.name}</h4>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentActivity === 'custom' && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Custom Status Message</h3>
            </div>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom status..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent mb-4"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              Set Custom Status
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
