import { useState } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Webhook, Plus, CheckCircle2, XCircle, Trash2, X } from 'lucide-react';

const WEBHOOKS = [
  { id: '1', url: 'https://api.myapp.com/webhooks/bb', events: ['user.created', 'research.published'], status: 'active', lastDelivery: '2 min ago', successRate: '99.9%' },
  { id: '2', url: 'https://analytics.internal.co/ingest', events: ['marketplace.purchase', 'venture.created'], status: 'active', lastDelivery: '1h ago', successRate: '100%' },
  { id: '3', url: 'https://staging.myapp.com/hooks', events: ['*'], status: 'failing', lastDelivery: '12h ago', successRate: '45.2%' },
];

const AVAILABLE_EVENTS = [
  'user.created', 'user.updated', 'research.published', 'research.updated',
  'marketplace.purchase', 'venture.created', 'venture.updated', 'project.completed',
  'community.post', 'election.started', 'election.ended', '*'
];

export default function WebhookCenter() {
  const [webhooks, setWebhooks] = useState(WEBHOOKS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });

  const toggleEvent = (event) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event) 
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const createWebhook = () => {
    if (!newWebhook.url.trim() || newWebhook.events.length === 0) return;
    
    const webhook = {
      id: Date.now().toString(),
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active',
      lastDelivery: 'Never',
      successRate: '100%'
    };
    
    setWebhooks([webhook, ...webhooks]);
    setNewWebhook({ url: '', events: [] });
    setShowCreateForm(false);
  };

  const deleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  return (
    <PageContainer>
      <PageHeader title="Webhooks" description="Subscribe to events occurring within the BeastBuck ecosystem." />

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Endpoint
        </Button>
      </div>

      {/* Create Webhook Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Webhook Endpoint</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Endpoint URL</label>
              <Input 
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://your-app.com/webhooks/beastbuck"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Events to Subscribe</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EVENTS.map(event => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      newWebhook.events.includes(event) 
                        ? 'bg-accent text-black' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-border'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createWebhook} disabled={!newWebhook.url.trim() || newWebhook.events.length === 0}>
                Create Webhook
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.map(w => (
          <div key={w.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <Webhook className="h-5 w-5 text-accent" />
                <h3 className="font-mono text-sm font-bold text-white">{w.url}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${w.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {w.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {w.events.map(e => (
                  <span key={e} className="rounded bg-white/10 px-2 py-1 text-text-muted">{e}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="text-text-muted">Last Delivery</p>
                <p className="font-bold text-white">{w.lastDelivery}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted">Success Rate</p>
                <p className={`font-bold ${parseFloat(w.successRate) > 90 ? 'text-emerald-400' : 'text-red-400'}`}>{w.successRate}</p>
              </div>
              <button onClick={() => deleteWebhook(w.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">Recent Deliveries</h3>
        <div className="space-y-2">
          {[
            { event: 'research.published', time: '2 min ago', status: 'success', id: 'evt_98x7z' },
            { event: 'user.created', time: '15 min ago', status: 'success', id: 'evt_23k4j' },
            { event: 'marketplace.purchase', time: '1h ago', status: 'failed', id: 'evt_19f3a' },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 text-xs last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {d.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                <span className="font-mono text-white">{d.event}</span>
                <span className="text-text-muted">{d.id}</span>
              </div>
              <span className="text-text-muted">{d.time}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
