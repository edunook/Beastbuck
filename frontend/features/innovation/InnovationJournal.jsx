import { useState, useEffect } from 'react';
import { Send, FileText, Image as ImageIcon } from 'lucide-react';
import { InnovationService } from '@services/firestore/innovation';
import { useAuth } from '../auth/AuthContext';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { formatDate } from '@shared/lib/dateUtils';

export default function InnovationJournal({ projectId }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newLog, setNewLog] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      try {
        const data = await InnovationService.getResearchLogs(projectId);
        setLogs(data);
      } catch (err) {
        console.error('Failed to load journal:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLog.trim() || !newTitle.trim()) return;

    setSubmitting(true);
    try {
      const id = await InnovationService.addResearchLog(projectId, {
        title: newTitle,
        observations: newLog,
        notes: '',
        mediaUrls: [], // Cloudinary implementation can be attached later
        authorId: user.uid,
      });

      // Optimistic update
      setLogs([{
        id,
        title: newTitle,
        observations: newLog,
        authorId: user.uid,
        timestamp: { toMillis: () => Date.now() }
      }, ...logs]);

      setNewTitle('');
      setNewLog('');
    } catch (err) {
      console.error('Failed to add log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Log Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-surface/30 p-4">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-text-muted">Add Journal Entry</h3>
        <input 
          type="text"
          placeholder="Entry Title..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="mb-3 w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none"
        />
        <textarea 
          placeholder="Record observations, notes, or discoveries..."
          value={newLog}
          onChange={e => setNewLog(e.target.value)}
          rows={4}
          className="mb-3 w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 text-text-soft hover:text-accent transition text-sm">
            <ImageIcon className="h-4 w-4" /> Add Media
          </button>
          <button 
            type="submit" 
            disabled={submitting || !newLog.trim() || !newTitle.trim()}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Save Entry
          </button>
        </div>
      </form>

      {/* Journal History */}
      <div className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-surface/10 p-8 text-center text-text-muted">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No journal entries yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-accent/50" />
                <div className="rounded-xl border border-border/40 bg-surface/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-bold text-white">{log.title}</h4>
                    <span className="text-xs text-text-soft">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-sm text-text-muted whitespace-pre-wrap">{log.observations}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
