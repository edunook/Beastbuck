import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

const INITIAL_KEYS = [
  { id: '1', name: 'Production App', key: 'sk_live_...a8f9', prefix: 'sk_live_', scopes: ['read', 'write'], created: 'Oct 12, 2025', lastUsed: '2 min ago' },
  { id: '2', name: 'Local Testing', key: 'sk_test_...b3c4', prefix: 'sk_test_', scopes: ['read', 'write', 'admin'], created: 'Dec 05, 2025', lastUsed: '1h ago' },
  { id: '3', name: 'Read-Only Service', key: 'sk_live_...c1d2', prefix: 'sk_live_', scopes: ['read'], created: 'Jan 15, 2026', lastUsed: 'Yesterday' },
];

export default function APIKeysCenter() {
  const [keys] = useState(INITIAL_KEYS);
  const [visibleKey, setVisibleKey] = useState(null);

  const toggleVisibility = (id) => {
    setVisibleKey(visibleKey === id ? null : id);
  };

  return (
    <PageContainer>
      <PageHeader title="API Keys" description="Manage your secret keys to authenticate requests to the BeastBuck API." />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">Do not share your secret API keys in publicly accessible areas.</p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-accent/80">
          <Plus className="h-4 w-4" /> Create API Key
        </button>
      </div>

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
                    <button className="text-text-muted hover:text-white"><Copy className="h-4 w-4" /></button>
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
                  <button className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
