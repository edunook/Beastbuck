import { useState, useEffect } from 'react';
import { WorkspaceService } from '../../services/firebase/workspace';
import Button from '../../components/ui/Button';
import { PlusCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function ResearchNotebookEditor({ notebookId }) {
  const { user } = useAuth();
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // New entry state
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('OBSERVATION');

  useEffect(() => {
    loadData();
  }, [notebookId]);

  const loadData = async () => {
    setLoading(true);
    // Ideally fetch notebook metadata too if needed
    const e = await WorkspaceService.getNotebookEntries(notebookId);
    setEntries(e);
    setLoading(false);
  };

  const handleSaveEntry = async () => {
    if(!newTitle.trim() || !newContent.trim()) return;
    
    // Fake ID for Phase 1 (in real app, docRef.id is generated)
    const entryId = `entry_${Date.now()}`;
    
    await WorkspaceService.saveNotebookEntry(notebookId, entryId, {
       title: newTitle,
       content: newContent,
       type: newType,
       authorId: user.uid
    }, true);
    
    setNewTitle('');
    setNewContent('');
    setShowNew(false);
    await loadData();
  };

  if (loading) return <div className="p-12 text-center text-text-muted">Loading notebook...</div>;

  const typeColors = {
     OBSERVATION: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
     HYPOTHESIS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
     EXPERIMENT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
     RESULT: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-white">Research Log</h2>
         <Button onClick={() => setShowNew(true)}><PlusCircle className="mr-2 h-4 w-4"/> Add Entry</Button>
      </div>

      {showNew && (
         <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-4">
            <h3 className="font-bold text-white">New Entry</h3>
            <div className="flex gap-4">
               <select value={newType} onChange={e=>setNewType(e.target.value)} className="w-40 rounded border border-border bg-black/20 p-2 text-sm text-white">
                  <option value="OBSERVATION">Observation</option>
                  <option value="HYPOTHESIS">Hypothesis</option>
                  <option value="EXPERIMENT">Experiment</option>
                  <option value="RESULT">Result</option>
               </select>
               <input type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Entry Title" className="flex-1 rounded border border-border bg-black/20 p-2 text-sm text-white" />
            </div>
            <textarea value={newContent} onChange={e=>setNewContent(e.target.value)} placeholder="Details..." rows={4} className="w-full rounded border border-border bg-black/20 p-2 text-sm text-white" />
            <div className="flex justify-end gap-2">
               <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
               <Button onClick={handleSaveEntry}>Save Entry</Button>
            </div>
         </div>
      )}

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
         {entries.map((entry) => (
            <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
               <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface/80 text-text-muted group-[.is-active]:text-accent group-[.is-active]:border-accent/30 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <Edit3 className="h-4 w-4" />
               </div>
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-white/[0.02] hover:bg-white/[0.04] transition">
                  <div className="flex items-center justify-between mb-2">
                     <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-widest ${typeColors[entry.type] || typeColors.OBSERVATION}`}>
                        {entry.type}
                     </span>
                     <time className="text-xs text-text-muted">{entry.timestamp?.toDate().toLocaleDateString()}</time>
                  </div>
                  <h4 className="font-bold text-white mb-2">{entry.title}</h4>
                  <p className="text-sm text-text-soft whitespace-pre-wrap">{entry.content}</p>
               </div>
            </div>
         ))}
         {entries.length === 0 && !showNew && (
            <p className="text-center text-text-muted italic py-8">No research entries yet. Start logging observations!</p>
         )}
      </div>
    </div>
  );
}
