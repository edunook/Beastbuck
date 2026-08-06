import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Slack, 
  Drive, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Plus, 
  Zap,
  BookOpen,
  Calendar,
  Mail
} from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive notifications in your Slack workspace',
    icon: Slack,
    category: 'Communication',
    status: 'connected',
    config: { workspace: 'beastbuck-workspace', channels: ['#general', '#notifications'] },
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Sync documents and files with Google Drive',
    icon: Drive,
    category: 'Storage',
    status: 'disconnected',
    config: {},
  },
  {
    id: 'external-learning',
    name: 'External Learning Platforms',
    description: 'Connect Coursera, Udemy, and other learning platforms',
    icon: BookOpen,
    category: 'Education',
    status: 'connected',
    config: { platforms: ['Coursera', 'Udemy'] },
  },
  {
    id: 'calendar',
    name: 'Calendar Sync',
    description: 'Sync events with Google Calendar or Outlook',
    icon: Calendar,
    category: 'Productivity',
    status: 'disconnected',
    config: {},
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Receive email updates for important events',
    icon: Mail,
    category: 'Communication',
    status: 'connected',
    config: { email: 'user@example.com', frequency: 'daily' },
  },
  {
    id: 'custom-webhook',
    name: 'Custom Webhook',
    description: 'Connect to any external service via webhooks',
    icon: ExternalLink,
    category: 'Developer',
    status: 'disconnected',
    config: {},
  },
];

export function IntegrationsHub() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const handleConnect = (id) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: 'connected' } : int
    ));
    setShowConfig(false);
  };

  const handleDisconnect = (id) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: 'disconnected', config: {} } : int
    ));
  };

  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setShowConfig(true);
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <PageContainer>
      <PageHeader 
        title="Integrations Hub" 
        description="Connect BeastBuck with your favorite tools and services."
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {integrations.filter(i => i.status === 'connected').length}
            </p>
            <p className="text-xs text-text-muted">Active Integrations</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{categories.length}</p>
            <p className="text-xs text-text-muted">Categories</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {integrations.filter(i => i.status === 'connected').reduce((acc, i) => acc + (i.config?.channels?.length || i.config?.platforms?.length || 1), 0)}
            </p>
            <p className="text-xs text-text-muted">Active Connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="mb-4 text-lg font-bold text-white">{category}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations
                .filter(i => i.category === category)
                .map(integration => {
                  const Icon = integration.icon;
                  return (
                    <Card key={integration.id} className="rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white">{integration.name}</span>
                              {integration.status === 'connected' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-text-muted" />
                              )}
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-text-muted">{integration.description}</p>
                        {integration.status === 'connected' && integration.config && (
                          <div className="space-y-1">
                            {integration.config.workspace && (
                              <p className="text-xs text-text-soft">Workspace: {integration.config.workspace}</p>
                            )}
                            {integration.config.channels && (
                              <div className="flex flex-wrap gap-1">
                                {integration.config.channels.map(ch => (
                                  <span key={ch} className="text-xs px-2 py-0.5 rounded bg-white/10 text-text-muted">
                                    {ch}
                                  </span>
                                ))}
                              </div>
                            )}
                            {integration.config.platforms && (
                              <div className="flex flex-wrap gap-1">
                                {integration.config.platforms.map(p => (
                                  <span key={p} className="text-xs px-2 py-0.5 rounded bg-white/10 text-text-muted">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                            {integration.config.email && (
                              <p className="text-xs text-text-soft">Email: {integration.config.email}</p>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {integration.status === 'connected' ? (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleConfigure(integration)}
                                className="flex-1"
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Configure
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDisconnect(integration.id)}
                                className="text-status-danger hover:text-status-danger/80"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnect(integration.id)}
                              className="flex-1"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Configure {selectedIntegration.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIntegration.id === 'slack' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Workspace</label>
                    <Input defaultValue={selectedIntegration.config?.workspace || ''} placeholder="your-workspace" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Channels (comma separated)</label>
                    <Input 
                      defaultValue={selectedIntegration.config?.channels?.join(', ') || ''} 
                      placeholder="#general, #notifications" 
                    />
                  </div>
                </>
              )}
              {selectedIntegration.id === 'google-drive' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Google Account</label>
                  <Button className="w-full">
                    <Drive className="mr-2 h-4 w-4" />
                    Connect Google Account
                  </Button>
                </div>
              )}
              {selectedIntegration.id === 'external-learning' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Platforms</label>
                  <div className="space-y-2">
                    {['Coursera', 'Udemy', 'edX', 'Pluralsight'].map(platform => (
                      <label key={platform} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={selectedIntegration.config?.platforms?.includes(platform)}
                          className="rounded border-border bg-white/5 text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-white">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {selectedIntegration.id === 'calendar' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Calendar Provider</label>
                  <select className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                    <option value="">Select provider</option>
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Microsoft Outlook</option>
                    <option value="apple">Apple Calendar</option>
                  </select>
                </div>
              )}
              {selectedIntegration.id === 'email' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Email Address</label>
                    <Input defaultValue={selectedIntegration.config?.email || ''} type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Frequency</label>
                    <select 
                      defaultValue={selectedIntegration.config?.frequency || 'daily'}
                      className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                </>
              )}
              {selectedIntegration.id === 'custom-webhook' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Webhook URL</label>
                    <Input placeholder="https://your-service.com/webhook" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white">Secret Key</label>
                    <Input type="password" placeholder="Optional secret for HMAC" />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowConfig(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowConfig(false)} className="flex-1">
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
