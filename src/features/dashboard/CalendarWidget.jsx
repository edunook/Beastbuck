import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Calendar, Clock, Users, Trophy, Zap, BriefcaseBusiness } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function CalendarWidget() {
  const { user } = useAuth();

  const events = [
    { id: 1, title: 'Team Meeting', type: 'Meeting', time: '2:00 PM', date: 'Today', icon: Users, color: 'purple' },
    { id: 2, title: 'Project Deadline', type: 'Deadline', time: '11:59 PM', date: 'Today', icon: Clock, color: 'red' },
    { id: 3, title: 'AI Workshop', type: 'Workshop', time: '10:00 AM', date: 'Tomorrow', icon: BriefcaseBusiness, color: 'cyan' },
    { id: 4, title: 'Hackathon', type: 'Hackathon', time: '9:00 AM', date: 'Saturday', icon: Trophy, color: 'amber' },
    { id: 5, title: 'Coding Competition', type: 'Competition', time: '3:00 PM', date: 'Sunday', icon: Zap, color: 'emerald' },
    { id: 6, title: 'Sarah\'s Birthday', type: 'Birthday', time: 'All Day', date: 'Monday', icon: Calendar, color: 'pink' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Calendar Widget" 
        description="Calendar display showing today's events, upcoming meetings, deadlines, birthdays, hackathons, competitions, and workshops."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {events.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className={`p-3 rounded-xl ${getColorClass(event.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{event.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-text-muted">
                      <span className={`px-2 py-1 rounded-full ${getColorClass(event.color)}`}>
                        {event.type}
                      </span>
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{event.date}</span>
                    </div>
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
