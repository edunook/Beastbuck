import { useState, useEffect } from 'react';
import { WorkspaceService } from '../../services/firebase/workspace';
import { useAuth } from '../auth/AuthContext';
import Button from '../../components/ui/Button';
import { Plus, Search, Pin, Trash2, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from '../../lib/dateUtils';

export default function NotesManager({ workspaceId }) {
  const { user, roleData } = useAuth();
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Note editor modal state
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: 'new', title: '', content: '', tags: '', isPinned: false, color: 'bg-surface' });
  const [saving, setSaving] = useState(false);

  const colors = [
     'bg-surface', 
     'bg-accent/10 border-accent/30', 
     'bg-status-success/10 border-status-success/30', 
     'bg-status-warning/10 border-status-warning/30', 
     'bg-status-danger/10 border-status-danger/30'
  ];

  useEffect(() => {
    loadNotes();
  }, [workspaceId]);

  const loadNotes = async () => {
    setLoading(true);
    const fetched = await WorkspaceService.getNotes(workspaceId);
    setNotes(fetched);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
       title: currentNote.title,
       content: currentNote.content,
       tags: currentNote.tags ? currentNote.tags.split(',').map(t=>t.trim()) : [],
       isPinned: currentNote.isPinned,
       color: currentNote.color,
       authorId: user.uid
    };
    
    await WorkspaceService.saveNote(currentNote.id, workspaceId, data, currentNote.id === 'new', user.uid);
    setSaving(false);
    setIsEditing(false);
    loadNotes();
  };

  const handleDelete = async (id) => {
    if(confirm('Delete this note?')) {
       await WorkspaceService.deleteNote(id, workspaceId);
       loadNotes();
    }
  };

  const togglePin = async (note) => {
    await WorkspaceService.saveNote(note.id, workspaceId, { isPinned: !note.isPinned }, false, user.uid);
    loadNotes();
  };

  const openEditor = (note = { id: 'new', title: '', content: '', tags: '', isPinned: false, color: 'bg-surface' }) => {
    setCurrentNote({
       ...note,
       tags: Array.isArray(note.tags) ? note.tags.join(', ') : ''
    });
    setIsEditing(true);
  };

  const filtered = notes.filter(n => 
     (n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.content?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  if (loading) {
     return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent"/></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search notes..."
               className="w-full h-10 bg-white/5 border border-border rounded-xl pl-9 pr-4 text-sm text-white focus:ring-2 focus:ring-accent outline-none"
            />
         </div>
         {isApprovedMember && <Button onClick={() => openEditor()}><Plus className="w-4 h-4 mr-2" /> New Note</Button>}
      </div>

      {notes.length === 0 ? (
         <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">No notes yet</h3>
            <p className="text-text-muted text-sm mb-4">Capture ideas, meeting notes, and quick thoughts.</p>
            {isApprovedMember && <Button variant="secondary" onClick={() => openEditor()}>Create Note</Button>}
         </div>
      ) : (
         <div className="space-y-8">
            {pinned.length > 0 && (
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Pin className="w-3 h-3"/> Pinned Notes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {pinned.map(note => <NoteCard key={note.id} note={note} onEdit={()=>openEditor(note)} onDelete={()=>handleDelete(note.id)} onPin={()=>togglePin(note)} />)}
                  </div>
               </div>
            )}
            
            {unpinned.length > 0 && (
               <div className="space-y-3">
                  {pinned.length > 0 && <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Other Notes</h4>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {unpinned.map(note => <NoteCard key={note.id} note={note} onEdit={()=>openEditor(note)} onDelete={()=>handleDelete(note.id)} onPin={()=>togglePin(note)} />)}
                  </div>
               </div>
            )}
         </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center p-4 border-b border-border">
                  <input 
                     value={currentNote.title} 
                     onChange={e=>setCurrentNote({...currentNote, title: e.target.value})} 
                     placeholder="Note Title" 
                     className="bg-transparent text-lg font-bold text-white outline-none placeholder:text-text-muted/50 flex-1"
                  />
                  <div className="flex gap-2">
                     <button onClick={()=>setCurrentNote({...currentNote, isPinned: !currentNote.isPinned})} className={`p-2 rounded-lg ${currentNote.isPinned ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-text-muted'}`}>
                        <Pin className="w-4 h-4" />
                     </button>
                     <button onClick={()=>setIsEditing(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted"><X className="w-4 h-4"/></button>
                  </div>
               </div>
               <div className="p-4 flex-1 overflow-y-auto">
                  <textarea 
                     value={currentNote.content}
                     onChange={e=>setCurrentNote({...currentNote, content: e.target.value})}
                     placeholder="Write your note here..."
                     className="w-full h-full min-h-[300px] bg-transparent text-sm text-text-soft outline-none resize-none placeholder:text-text-muted/50"
                  />
               </div>
               <div className="p-4 border-t border-border flex flex-wrap gap-4 items-center justify-between bg-black/20 rounded-b-2xl">
                  <div className="flex items-center gap-2">
                     {colors.map(c => (
                        <button 
                           key={c} 
                           onClick={()=>setCurrentNote({...currentNote, color: c})}
                           className={`w-6 h-6 rounded-full border-2 ${currentNote.color === c ? 'border-white' : 'border-transparent'} ${c.split(' ')[0]}`}
                        />
                     ))}
                  </div>
                  <input 
                     type="text" 
                     value={currentNote.tags} 
                     onChange={e=>setCurrentNote({...currentNote, tags: e.target.value})} 
                     placeholder="Tags (comma separated)" 
                     className="bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-accent w-48"
                  />
                  <div className="flex gap-2">
                     <Button variant="secondary" onClick={()=>setIsEditing(false)}>Cancel</Button>
                     <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</Button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onPin }) {
   return (
      <div className={`relative group rounded-xl border p-4 flex flex-col h-48 transition-all hover:scale-[1.02] cursor-pointer ${note.color || 'bg-surface border-border'}`} onClick={onEdit}>
         <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-sm line-clamp-1">{note.title || 'Untitled Note'}</h3>
            <button onClick={(e)=>{e.stopPropagation(); onPin();}} className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${note.isPinned ? 'text-accent opacity-100' : 'text-text-muted hover:text-white'}`}>
               <Pin className="w-3 h-3" />
            </button>
         </div>
         <p className="text-xs text-text-soft line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>
         <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-text-muted uppercase tracking-widest">{note.updatedAt ? formatDistanceToNow(note.updatedAt.toDate()) : 'Just now'}</p>
            <div className="flex gap-1">
               <button onClick={(e)=>{e.stopPropagation(); onDelete();}} className="p-1.5 rounded-lg text-text-muted hover:bg-status-danger/20 hover:text-status-danger opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3 h-3" />
               </button>
            </div>
         </div>
      </div>
   );
}
