import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Copy, Eye, EyeOff, Plus, Trash2, X, Check } from 'lucide-react';

const INITIAL_KEYS = [
  { id: '1', name: 'Production App', key: 'sk_live_...a8f9', prefix: 'sk_live_', scopes: ['read', 'write'], created: 'Oct 12, 2025', lastUsed: '2 min ago' },
  { id: '2', name: 'Local Testing', key: 'sk_test_...b3c4', prefix: 'sk_test_', scopes: ['read', 'write', 'admin'], created: 'Dec 05, 2025', lastUsed: '1h ago' },
  { id: '3', name: 'Read-Only Service', key: 'sk_live_...c1d2', prefix: 'sk_live_', scopes: ['read'], created: 'Jan 15, 2026', lastUsed: 'Yesterday' },
];

export default function APIKeysCenter() {
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [visibleKey, setVisibleKey] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState(['read']);
  const [newKeyPrefix, setNewKeyPrefix] = useState('sk_live_');
  const [copiedKey, setCopiedKey] = useState(null);

  const toggleVisibility = (id) => {
    setVisibleKey(visibleKey === id ? null : id);
  };

  const toggleScope = (scope) => {
    setNewKeyScopes(prev => 
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const generateKey = () => {
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `${newKeyPrefix}${randomPart}`;
  };

  const createKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: generateKey(),
      prefix: newKeyPrefix,
      scopes: newKeyScopes,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never'
    };
    
    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setNewKeyScopes(['read']);
    setShowCreateForm(false);
  };

  const deleteKey = (id) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <PageContainer>
      <PageHeader title="API Keys" description="Manage your secret keys to authenticate requests to the BeastBuck API." />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">Do not share your secret API keys in publicly accessible areas.</p>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create API Key
        </Button>
      </div>

      {/* Create Key Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New API Key</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Key Name</label>
              <Input 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production App"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Environment</label>
              <select 
                value={newKeyPrefix}
                onChange={(e) => setNewKeyPrefix(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="sk_live_">Production (sk_live_)</option>
                <option value="sk_test_">Testing (sk_test_)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {['read', 'write', 'admin'].map(scope => (
                  <button
                    key={scope}
                    onClick={() => toggleScope(scope)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      newKeyScopes.includes(scope) 
                        ? 'bg-accent text-black' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-border'
                    }`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createKey} disabled={!newKeyName.trim()}>
                Create Key
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-depth-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface/60 text-left text-text-muted">
              <th className="px-4 py-3 text-caption font-semibold">Name</th>
              <th className="px-4 py-3">Secret Key</th>
              <th className="px-4 py-3">Scopes</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last Used</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="border-b border-border/50 bg-surface/30">
                <td className="px-4 py-3 font-bold text-white">{k.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white">{visibleKey === k.id ? `${k.prefix}8f92bd3a41c5ef6` : k.key}</span>
                    <button onClick={() => toggleVisibility(k.id)} className="text-text-muted hover:text-white">
                      {visibleKey === k.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => copyKey(k.key)} className="text-text-muted hover:text-white">
                      {copiedKey === k.key ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map(s => (
                      <span key={s} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-white">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{k.created}</td>
                <td className="px-4 py-3 text-text-muted">{k.lastUsed}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteKey(k.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
