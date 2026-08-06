import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bell, AtSign, CheckCircle, ClipboardList, MessageSquare, Calendar } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function NotificationsWidget() {
  const { user } = useAuth();

  const notifications = [
    { id: 1, type: 'Unread', count: 5, icon: Bell, color: 'red' },
    { id: 2, type: 'Mentions', count: 3, icon: AtSign, color: 'cyan' },
    { id: 3, type: 'Approvals', count: 2, icon: CheckCircle, color: 'emerald' },
    { id: 4, type: 'Task Assignments', count: 4, icon: ClipboardList, color: 'amber' },
    { id: 5, type: 'Messages', count: 8, icon: MessageSquare, color: 'purple' },
    { id: 6, type: 'Meeting Invitations', count: 1, icon: Calendar, color: 'pink' },
  ];

  const getColorClass = (color) => {
    const colors = {
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.red;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notifications Widget" 
        description="Notification widget showing unread, mentions, approvals, task assignments, messages, and meeting invitations that opens the Notification Center."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className={`p-3 rounded-xl ${getColorClass(notification.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{notification.type}</h3>
                    <p className="text-2xl font-bold text-accent">{notification.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
            Open Notification Center
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
