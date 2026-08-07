import { useState } from 'react';
import { Circle, Clock, Moon, X, EyeOff, Edit3 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function PresenceStatus() {
  const [currentStatus, setCurrentStatus] = useState('online');
  const [customStatus, setCustomStatus] = useState('');

  const statuses = [
    { id: 'online', name: 'Online', icon: Circle, color: 'emerald', description: 'Available for communication' },
    { id: 'away', name: 'Away', icon: Clock, color: 'amber', description: 'Away from keyboard' },
    { id: 'busy', name: 'Busy', icon: X, color: 'red', description: 'Do not disturb' },
    { id: 'dnd', name: 'Do Not Disturb', icon: Moon, color: 'red', description: 'Completely unavailable' },
    { id: 'offline', name: 'Offline', icon: Circle, color: 'gray', description: 'Appear offline' },
    { id: 'invisible', name: 'Invisible', icon: EyeOff, color: 'gray', description: 'Hide presence' },
  ];

  const getStatusColor = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Presence Status" 
        description="Status options including Online, Away, Busy, Do Not Disturb, Offline, Invisible, and Custom Status."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Circle className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Select Status</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statuses.map((status) => {
              const Icon = status.icon;
              return (
                <button
                  key={status.id}
                  onClick={() => setCurrentStatus(status.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    currentStatus === status.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${getStatusColor(status.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{status.name}</h4>
                  <p className="text-text-muted text-sm">{status.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Custom Status</h3>
          </div>
          <input
            type="text"
            value={customStatus}
            onChange={(e) => setCustomStatus(e.target.value)}
            placeholder="Set a custom status message..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent mb-4"
          />
          <Button className="bg-purple-600 hover:bg-purple-700">
            Set Status
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
