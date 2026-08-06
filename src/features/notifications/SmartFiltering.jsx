import { useState } from 'react';
import { Filter, Bell, MessageSquare, FolderKanban, FileText, ShoppingCart, Bot, Film, Users, Calendar, Shield, Award } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function SmartFiltering() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All', icon: Bell, color: 'purple' },
    { id: 'unread', name: 'Unread', icon: Bell, color: 'amber' },
    { id: 'important', name: 'Important', icon: Bell, color: 'red' },
    { id: 'mentions', name: 'Mentions', icon: MessageSquare, color: 'cyan' },
    { id: 'projects', name: 'Projects', icon: FolderKanban, color: 'blue' },
    { id: 'research', name: 'Research', icon: FileText, color: 'emerald' },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingCart, color: 'orange' },
    { id: 'ai', name: 'AI Studio', icon: Bot, color: 'violet' },
    { id: 'funflix', name: 'FunFlix', icon: Film, color: 'rose' },
    { id: 'community', name: 'Community', icon: Users, color: 'teal' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'sky' },
    { id: 'system', name: 'System', icon: Shield, color: 'gray' },
    { id: 'leadership', name: 'Leadership', icon: Award, color: 'gold' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Smart Filtering" 
        description="Notification filtering including Unread, Important, Mentions, Projects, Research, Marketplace, AI Studio, FunFlix, Community, Events, System, and Leadership."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Filter Notifications</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    activeFilter === filter.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-white">{filter.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-text-muted">Active Filter:</span>
              <span className="text-accent font-bold capitalize">{activeFilter.replace(/([A-Z])/g, ' $1')}</span>
            </div>
            <p className="text-text-muted text-sm">
              Showing {activeFilter === 'all' ? 'all notifications' : `${activeFilter} notifications only`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Smart Filtering Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">AI-powered relevance sorting</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Priority-based filtering</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Time-based grouping</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Category-based organization</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Custom filter combinations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
