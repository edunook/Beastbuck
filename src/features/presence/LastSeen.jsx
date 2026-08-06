import { useState } from 'react';
import { Clock, EyeOff } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function LastSeen() {
  const [hideLastSeen, setHideLastSeen] = useState(false);

  const lastSeenData = {
    current: 'Just Now',
    examples: [
      { id: 'just-now', label: 'Just Now', time: '0 minutes ago' },
      { id: '5-min', label: '5 Minutes Ago', time: '5 minutes ago' },
      { id: '1-hour', label: '1 Hour Ago', time: '1 hour ago' },
      { id: 'yesterday', label: 'Yesterday', time: '1 day ago' },
    ],
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Last Seen" 
        description="Last seen display including Just Now, 5 Minutes Ago, 1 Hour Ago, Yesterday, and Hidden (if privacy enabled)."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Last Seen Settings</h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-6">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-text-muted" />
              <div>
                <p className="text-white font-bold">Hide Last Seen</p>
                <p className="text-text-muted text-sm">Others won't see when you were last online</p>
              </div>
            </div>
            <button
              onClick={() => setHideLastSeen(!hideLastSeen)}
              className={`w-12 h-6 rounded-full transition-all ${hideLastSeen ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-all ${hideLastSeen ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <h4 className="font-bold text-white mb-4">Last Seen Examples</h4>
          <div className="space-y-3">
            {lastSeenData.examples.map((example) => (
              <div key={example.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white">{example.label}</span>
                <span className="text-text-muted text-sm">{example.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Automatically updates when you're active</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Shows relative time (e.g., "5 minutes ago")</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Can be hidden for privacy</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-white">Respects your privacy settings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
