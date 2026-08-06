import { useState } from 'react';
import { MessageCircle, Circle, Edit3, Mic, Eye, Check } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PresenceInChat() {
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [showRecordingIndicator, setShowRecordingIndicator] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(false);

  const chatIndicators = [
    { id: 'online-dot', name: 'Green Online Dot', icon: Circle, color: 'emerald', description: 'Shows when someone is online' },
    { id: 'typing', name: 'Typing Indicator', icon: Edit3, color: 'blue', description: 'Shows when someone is typing' },
    { id: 'recording', name: 'Recording Indicator', icon: Mic, color: 'red', description: 'Shows when someone is recording' },
    { id: 'active-now', name: 'Active Now', icon: MessageCircle, color: 'purple', description: 'Shows active users' },
    { id: 'last-seen', name: 'Last Seen', icon: Eye, color: 'amber', description: 'Shows when someone was last online' },
    { id: 'read-receipts', name: 'Read Receipts', icon: Check, color: 'cyan', description: 'Shows when messages are read' },
  ];

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Presence in Chat" 
        description="Chat presence indicators including Green Online Dot, Typing Indicator, Recording Indicator, Active Now, Last Seen, and Read Receipts (optional)."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Chat Presence Indicators</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chatIndicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <div key={indicator.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className={`p-3 rounded-xl ${getColorClass(indicator.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{indicator.name}</h4>
                  <p className="text-text-muted text-sm">{indicator.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Indicator Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Edit3 className="h-5 w-5 text-text-muted" />
                <span className="text-white">Show Typing Indicator</span>
              </div>
              <button
                onClick={() => setShowTypingIndicator(!showTypingIndicator)}
                className={`w-12 h-6 rounded-full transition-all ${showTypingIndicator ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${showTypingIndicator ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-text-muted" />
                <span className="text-white">Show Recording Indicator</span>
              </div>
              <button
                onClick={() => setShowRecordingIndicator(!showRecordingIndicator)}
                className={`w-12 h-6 rounded-full transition-all ${showRecordingIndicator ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${showRecordingIndicator ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-text-muted" />
                <span className="text-white">Show Read Receipts (Optional)</span>
              </div>
              <button
                onClick={() => setShowReadReceipts(!showReadReceipts)}
                className={`w-12 h-6 rounded-full transition-all ${showReadReceipts ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${showReadReceipts ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Settings
      </Button>
    </PageContainer>
  );
}
