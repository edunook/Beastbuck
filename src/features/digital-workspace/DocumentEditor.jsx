import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../auth/AuthContext';
import { WorkspaceService } from '../../services/firebase/workspace';
import { DocumentPresenceService } from '../../services/realtime/documentPresence';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, ChevronLeft, History, Loader2, FileText, Sparkles, Lightbulb } from 'lucide-react';
import { AIContextPanel } from '../ai/AIContextPanel';

export default function DocumentEditor({ workspaceId, docId, onClose }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('WORKSPACE');
  const [loading, setLoading] = useState(docId !== 'new');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeEditors, setActiveEditors] = useState({});
  const [collaborationVersion, setCollaborationVersion] = useState(1);
  const [collaborationMode, setCollaborationMode] = useState('LIVE');
  
  // Create editor instance
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-full',
      },
    },
    onUpdate: () => {
      debouncedSave();
    },
    onSelectionUpdate: ({ editor }) => {
       if (docId !== 'new' && user) {
           const { from } = editor.state.selection;
           DocumentPresenceService.updateCursor(docId, user.uid, { index: from });
       }
    }
  });

  // Debounced auto-save ref
  const saveTimeout = useRef(null);

  useEffect(() => {
    if (docId !== 'new') {
      loadDocument();
      
      const unsubscribePresence = DocumentPresenceService.subscribeToDocPresence(docId, (editors) => {
         setActiveEditors(editors);
      });
      
      const leavePresence = DocumentPresenceService.joinDocument(docId, {
         uid: user.uid,
         name: user.displayName || user.email,
         avatar: user.photoURL || ''
      });
      
      return () => {
         unsubscribePresence();
         leavePresence();
      };
    }
  }, [docId, user]);

  const loadDocument = async () => {
    setLoading(true);
    const doc = await WorkspaceService.getDocument(docId);
    if (doc) {
      setTitle(doc.title || '');
      setVisibility(doc.visibility || 'WORKSPACE');
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(doc.content || '');
      }
      setLastSaved(doc.lastEditedAt?.toDate());
      if (doc.collaborationVersion) setCollaborationVersion(doc.collaborationVersion);
      if (doc.collaborationMode) setCollaborationMode(doc.collaborationMode);
    }
    setLoading(false);
  };

  const handleManualSave = async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    await saveContent();
    // Also save a version history point
    if (docId !== 'new') {
      await WorkspaceService.saveDocumentVersion(docId, editor.getHTML(), user.uid);
    }
  };

  const saveContent = async () => {
    if (!editor) return;
    setSaving(true);
    const data = {
      title,
      visibility,
      content: editor.getHTML(),
      authorId: user.uid,
      lastEditor: user.uid,
      collaborationVersion: collaborationVersion + 1,
      collaborationMode,
    };
    
    // For 'new', we actually need to create it and then we can't easily swap the ID without a redirect.
    // In a real app we'd redirect to the actual URL `/workspace/:id/doc/:docId` upon first save.
    // Assuming docId is handled safely in WorkspaceDetail for now.
    
    if (docId !== 'new') {
      await WorkspaceService.saveDocument(docId, workspaceId, data, false, user.uid);
      setLastSaved(new Date());
    } else {
       // In complete implementation we generate ID and update parent state
       console.log('Would create new doc:', data);
    }
    
    setSaving(false);
  };

  const debouncedSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving(true);
    saveTimeout.current = setTimeout(() => {
      saveContent();
    }, 2000);
  };

  // Editor toolbar actions
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleHeading = (level) => editor?.chain().focus().toggleHeading({ level }).run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();

  if (loading) {
     return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-white transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Input 
            value={title} 
            onChange={e => { setTitle(e.target.value); debouncedSave(); }} 
            placeholder="Untitled Document" 
            className="border-none bg-transparent text-lg font-bold outline-none ring-0 focus:ring-0 max-w-[300px]" 
          />
          <span className="text-xs text-text-muted">
            {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {Object.entries(activeEditors).map(([uid, editorProfile]) => (
                <div key={uid} className="w-6 h-6 rounded-full bg-accent/20 border border-surface flex items-center justify-center overflow-hidden" title={editorProfile.name}>
                   {editorProfile.avatar ? <img src={editorProfile.avatar} alt="Avatar" /> : <span className="text-[10px] text-accent font-bold">{editorProfile.name?.charAt(0)}</span>}
                </div>
            ))}
          </div>
          <select 
            value={visibility} 
            onChange={e => { setVisibility(e.target.value); debouncedSave(); }}
            className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="PRIVATE">Private</option>
            <option value="WORKSPACE">Workspace</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="PUBLIC">Public</option>
          </select>
          <Button variant="secondary" size="sm" onClick={handleManualSave}>
            <Save className="mr-2 h-4 w-4" /> Save v{collaborationVersion}
          </Button>
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Editor & Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex gap-2 border-b border-border bg-surface/80 p-2 backdrop-blur-sm">
             <button onClick={() => toggleHeading(1)} className={`px-2 py-1 text-sm rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>H1</button>
             <button onClick={() => toggleHeading(2)} className={`px-2 py-1 text-sm rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>H2</button>
             <div className="w-px bg-border/50 mx-1"></div>
             <button onClick={toggleBold} className={`px-2 py-1 text-sm rounded font-bold ${editor?.isActive('bold') ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>B</button>
             <button onClick={toggleItalic} className={`px-2 py-1 text-sm rounded italic ${editor?.isActive('italic') ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>I</button>
             <div className="w-px bg-border/50 mx-1"></div>
             <button onClick={toggleBulletList} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-accent/20 text-accent' : 'hover:bg-white/5'}`}>List</button>
          </div>
          
          <div className="p-8 pb-32">
             <EditorContent editor={editor} />
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-80 border-l border-border bg-surface/30 flex flex-col p-4">
           <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest mb-4">Document AI</h3>
           <AIContextPanel 
              actions={[
                 { label: 'Summarize Document', prompt: 'Please summarize this document in 3 bullet points.', icon: FileText },
                 { label: 'Improve Writing', prompt: 'Review this document and suggest improvements for clarity and tone.', icon: Sparkles },
                 { label: 'Generate Ideas', prompt: 'Based on this document, brainstorm 5 follow-up ideas or next steps.', icon: Lightbulb }
              ]}
           />
        </div>
      </div>
    </div>
  );
}
