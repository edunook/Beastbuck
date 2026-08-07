import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sun, Moon, Calendar, Clock, Quote, Target } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good Morning');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const dailyMission = 'Complete 2 tasks, Attend AI Workshop, Review Research Proposal';

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard Header" 
        description="Dynamic header with greeting, current date, current time, weather (optional future), motivational quote, and daily mission."
        hero={true}
      />

      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">{getGreeting()}, {user?.displayName || 'User'}!</h1>
            <div className="flex items-center gap-6 text-text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white">Motivational Quote</h3>
              </div>
              <p className="text-text-muted italic">"Innovation distinguishes between a leader and a follower."</p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white">Daily Mission</h3>
              </div>
              <p className="text-text-muted">{dailyMission}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white">Weather</h3>
              </div>
              <p className="text-text-muted">Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
