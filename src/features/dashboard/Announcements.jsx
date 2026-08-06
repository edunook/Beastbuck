import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bell, AlertTriangle, Info, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function Announcements() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState({});

  const announcements = [
    { id: 1, title: 'System Maintenance', content: 'Scheduled maintenance on Sunday 2-4 AM UTC', priority: 'High', pinned: true, date: '2024-01-20' },
    { id: 2, title: 'New Features Released', content: 'Check out the new AI Studio and FunFlix features', priority: 'Normal', pinned: false, date: '2024-01-18' },
    { id: 3, title: 'Security Update', content: 'Please update your password for enhanced security', priority: 'Urgent', pinned: true, date: '2024-01-19' },
    { id: 4, title: 'Community Event', content: 'Join our virtual hackathon this weekend', priority: 'Normal', pinned: false, date: '2024-01-17' },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-500/10 border-red-500/30 text-red-400',
      Normal: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      Urgent: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    };
    return colors[priority] || colors.Normal;
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Announcements" 
        description="Latest announcements with priority colors (High Priority, Normal, Urgent, Pinned) and expandable content."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.pinned && (
                        <Pin className="h-4 w-4 text-amber-400" />
                      )}
                      <h3 className="font-bold text-white">{announcement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm mb-2">{announcement.date}</p>
                    <p className={`text-text-soft ${expanded[announcement.id] ? '' : 'line-clamp-2'}`}>
                      {announcement.content}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(announcement.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    {expanded[announcement.id] ? (
                      <ChevronUp className="h-5 w-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-text-muted" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
