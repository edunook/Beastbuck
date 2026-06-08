import { useState, useEffect } from 'react';
import { Brain, Trash2, Power, PowerOff, Edit3, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { AIMemoryService } from '../../services/ai/aiMemory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AIMemoryManager() {
  const { user } = useAuth();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    loadMemory();
  }, [user]);

  const loadMemory = async () => {
    setLoading(true);
    const m = await AIMemoryService.getMemory(user.uid);
    setMemory(m);
    setLoading(false);
  };

  const toggleEnabled = async () => {
    setSaving(true);
    const next = !(memory?.enabled ?? true);
    await AIMemoryService.setMemoryEnabled(user.uid, next);
    await loadMemory();
    setStatus(next ? 'AI Memory enabled.' : 'AI Memory disabled.');
    setSaving(false);
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all AI memory? This cannot be undone.')) return;
    setSaving(true);
    await AIMemoryService.clearMemory(user.uid);
    await loadMemory();
    setStatus('All AI memory cleared.');
    setSaving(false);
  };

  const deleteKey = async (key) => {
    setSaving(true);
    const updated = { ...(memory?.data || {}) };
    delete updated[key];
    await AIMemoryService.updateMemory(user.uid, { data: updated });
    await loadMemory();
    setStatus(`Deleted "${key}" from memory.`);
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editKey) return;
    setSaving(true);
    await AIMemoryService.updateMemory(user.uid, { data: { [editKey]: editValue } });
    setEditKey(null);
    setEditValue('');
    await loadMemory();
    setStatus(`Updated "${editKey}".`);
    setSaving(false);
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving(true);
    await AIMemoryService.updateMemory(user.uid, { data: { [newKey.trim()]: newValue.trim() } });
    setNewKey('');
    setNewValue('');
    await loadMemory();
    setStatus(`Added "${newKey.trim()}" to memory.`);
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  const entries = Object.entries(memory?.data || {});
  const isEnabled = memory?.enabled !== false;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" /> AI Memory
        </CardTitle>
        <CardDescription>
          View, edit, or delete what the AI remembers about you. Your memory is private and stored securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status && (
          <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
            {status}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isEnabled ? 'secondary' : 'primary'}
            size="sm"
            onClick={toggleEnabled}
            disabled={saving}
          >
            {isEnabled ? <><PowerOff className="mr-2 h-4 w-4" /> Disable Memory</> : <><Power className="mr-2 h-4 w-4" /> Enable Memory</>}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={saving} className="text-status-danger hover:bg-status-danger/10 hover:text-status-danger">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Memory
          </Button>
        </div>

        {!isEnabled && (
          <div className="rounded-xl border border-status-warning/20 bg-status-warning/5 p-4 text-sm text-status-warning">
            AI Memory is currently disabled. The AI assistant will not remember preferences or context between sessions.
          </div>
        )}

        {/* Existing entries */}
        {entries.length === 0 ? (
          <p className="text-sm text-text-muted">No memory entries stored yet. The AI will learn your preferences as you interact.</p>
        ) : (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Stored Memory ({entries.length} entries)</h4>
            {entries.map(([key, val]) => (
              <div key={key} className="flex items-start gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
                {editKey === key ? (
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-bold uppercase text-accent">{key}</p>
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}><Save className="mr-1 h-3 w-3" /> Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditKey(null)}><X className="mr-1 h-3 w-3" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase text-accent mb-1">{key}</p>
                      <p className="text-sm text-text-soft whitespace-pre-wrap break-words">{typeof val === 'string' ? val : JSON.stringify(val)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditKey(key); setEditValue(typeof val === 'string' ? val : JSON.stringify(val)); }} className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteKey(key)} className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new entry */}
        <div className="border-t border-border/50 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Add Memory Entry</h4>
          <form onSubmit={addEntry} className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Key (e.g. interests)" value={newKey} onChange={e => setNewKey(e.target.value)} className="sm:w-40" />
            <Input placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={saving || !newKey.trim() || !newValue.trim()} size="sm">Add</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
