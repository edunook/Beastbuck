import { useState } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Settings2, Power, PowerOff, Zap, Check, X } from 'lucide-react';

const PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', status: 'Primary', latency: '45ms', cost: '$0.00/1k', active: true, icon: '✨', apiKey: '', model: 'gemini-pro' },
  { id: 'openai', name: 'OpenAI GPT-4', status: 'Fallback', latency: '120ms', cost: '$0.01/1k', active: true, icon: '🧠', apiKey: '', model: 'gpt-4' },
  { id: 'claude', name: 'Anthropic Claude 3', status: 'Research Task', latency: '95ms', cost: '$0.015/1k', active: true, icon: '👁️', apiKey: '', model: 'claude-3-opus' },
  { id: 'llama', name: 'Local Model (Llama 3)', status: 'Offline Mode', latency: '15ms', cost: 'Free', active: false, icon: '🦙', apiKey: '', model: 'llama-3-70b' },
];

export default function AIProviderCenter() {
  const [providers, setProviders] = useState(PROVIDERS);
  const [showConfig, setShowConfig] = useState(null);
  const [configData, setConfigData] = useState({ apiKey: '', model: '' });

  const toggleProvider = (id) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const openConfig = (provider) => {
    setShowConfig(provider.id);
    setConfigData({ apiKey: provider.apiKey, model: provider.model });
  };

  const saveConfig = () => {
    if (!showConfig) return;
    setProviders(prev => prev.map(p => 
      p.id === showConfig ? { ...p, apiKey: configData.apiKey, model: configData.model } : p
    ));
    setShowConfig(null);
  };

  const setAsPrimary = (id) => {
    setProviders(prev => prev.map(p => ({
      ...p,
      status: p.id === id ? 'Primary' : p.active ? 'Fallback' : 'Offline Mode'
    })));
  };

  return (
    <PageContainer>
      <PageHeader title="AI Provider Hub" description="Manage LLM providers, routing logic, and usage costs." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[{ label: 'Total API Calls (30d)', value: '4.2M' }, { label: 'Avg Latency', value: '78ms' }, { label: 'Est. Cost', value: '$45.20' }].map((s, i) => (
          <Card key={i} className="rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configure {providers.find(p => p.id === showConfig)?.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowConfig(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">API Key</label>
              <Input 
                type="password"
                value={configData.apiKey}
                onChange={(e) => setConfigData({ ...configData, apiKey: e.target.value })}
                placeholder="Enter your API key"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Model</label>
              <Input 
                value={configData.model}
                onChange={(e) => setConfigData({ ...configData, model: e.target.value })}
                placeholder="e.g., gemini-pro, gpt-4, claude-3-opus"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveConfig}>
                <Check className="mr-2 h-4 w-4" /> Save Configuration
              </Button>
              <Button variant="ghost" onClick={() => setShowConfig(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {providers.map((p) => (
          <Card key={p.id} className="rounded-xl">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">{p.icon}</div>
                  <div>
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      p.status === 'Primary' ? 'bg-accent/20 text-accent' :
                      p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'
                    }`}>{p.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-text-muted">Latency</p>
                    <p className="font-bold text-white">{p.latency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Cost</p>
                    <p className="font-bold text-white">{p.cost}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={p.active ? 'secondary' : 'default'}
                      onClick={() => toggleProvider(p.id)}
                    >
                      {p.active ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                      {p.active ? 'Disable' : 'Enable'}
                    </Button>
                    {p.active && p.status !== 'Primary' && (
                      <Button size="sm" variant="secondary" onClick={() => setAsPrimary(p.id)}>
                        <Zap className="h-4 w-4 mr-1" /> Set Primary
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openConfig(p)}>
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
