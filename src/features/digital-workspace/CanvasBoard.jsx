import { useState, useEffect } from 'react';
import { WorkspaceService } from '../../services/firebase/workspace';
import { WhiteboardSyncService } from '../../services/realtime/whiteboardSync';
import { useAuth } from '../auth/AuthContext';
import Button from '../../components/ui/Button';
import { MousePointer2, Square, Circle, Type, Save, Trash2 } from 'lucide-react';

// Phase 1: Simple Canvas Board (Sticky Notes / Flow Diagramming)
export default function CanvasBoard({ workspaceId, boardId, type = 'whiteboard', onClose }) {
  const [elements, setElements] = useState([]);
  const [title, setTitle] = useState('Untitled Board');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('select'); // select | rect | circle | text
  const [cursors, setCursors] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if(boardId !== 'new') {
       loadBoard();
       
       const unsubElements = WhiteboardSyncService.subscribeToElements(boardId, (serverElements) => {
          // Convert map to array for rendering
          setElements(Object.values(serverElements));
       });
       
       const unsubPresence = WhiteboardSyncService.subscribeToPresence(boardId, (presence) => {
          setCursors(presence);
       });
       
       const leaveWhiteboard = WhiteboardSyncService.joinWhiteboard(boardId, {
          uid: user.uid,
          name: user.displayName || user.email,
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random cursor color
       });
       
       return () => {
          unsubElements();
          unsubPresence();
          leaveWhiteboard();
       };
    }
  }, [boardId, user]);

  const loadBoard = async () => {
     if(type === 'whiteboard') {
        const boards = await WorkspaceService.getWhiteboards(workspaceId);
        const b = boards.find(x => x.id === boardId);
        if(b) {
           setTitle(b.title || '');
           // Elements are now loaded via real-time listener above
        }
     } else {
        const maps = await WorkspaceService.getMindMaps(workspaceId);
        const m = maps.find(x => x.id === boardId);
        if(m) {
           setTitle(m.title || '');
           // Elements are now loaded via real-time listener above
        }
     }
  };

  const handleSave = async () => {
     setSaving(true);
     const data = { title };
     if(type === 'whiteboard') {
        // elements are synced in real-time, but we can save snapshots
        await WhiteboardSyncService.createSnapshot(boardId, elements, user.uid);
        await WorkspaceService.saveWhiteboard(boardId, workspaceId, data, false); // Just update title
     } else {
        await WhiteboardSyncService.createSnapshot(boardId, elements, user.uid);
        await WorkspaceService.saveMindMap(boardId, workspaceId, data, false);
     }
     setSaving(false);
  };

  const addElement = (shapeType) => {
     const newEl = {
        id: Date.now().toString(),
        type: shapeType,
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        w: shapeType === 'text' ? 120 : 100,
        h: shapeType === 'text' ? 40 : 100,
        text: shapeType === 'text' ? 'New Text' : '',
        color: '#2b2b2b'
     };
     setMode('select');
     if (boardId !== 'new') {
        WhiteboardSyncService.addElement(boardId, newEl);
     } else {
        setElements([...elements, newEl]);
     }
  };

  const updateElement = (id, updates) => {
     if (boardId !== 'new') {
        WhiteboardSyncService.updateElement(boardId, id, updates);
     } else {
        setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
     }
  };

  const deleteElement = (id) => {
     if (boardId !== 'new') {
        WhiteboardSyncService.removeElement(boardId, id);
     } else {
        setElements(elements.filter(e => e.id !== id));
     }
  };

  // Very basic dragging for Phase 1
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const startDrag = (e, id, elX, elY) => {
     if(mode !== 'select') return;
     setDraggingId(id);
     setDragOffset({ x: e.clientX - elX, y: e.clientY - elY });
  };

  const onDrag = (e) => {
     if(draggingId) {
        updateElement(draggingId, {
           x: e.clientX - dragOffset.x,
           y: e.clientY - dragOffset.y
        });
     }
     
     if (boardId !== 'new' && user) {
        // We need to account for canvas bounds in a real implementation, using clientX/Y for simplicity here
        WhiteboardSyncService.updateCursor(boardId, user.uid, e.clientX, e.clientY);
     }
  };

  const stopDrag = () => {
     setDraggingId(null);
  };

  return (
    <div className="flex h-[80vh] flex-col rounded-xl border border-border bg-black/40 overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-2">
         <div className="flex items-center gap-4">
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="bg-transparent font-bold text-white outline-none w-48" placeholder="Board Title" />
            
            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-border">
               <button onClick={()=>setMode('select')} className={`p-1.5 rounded ${mode==='select'?'bg-accent/20 text-accent':'text-text-muted hover:text-white'}`}><MousePointer2 className="h-4 w-4"/></button>
               <button onClick={()=>addElement('rect')} className={`p-1.5 rounded ${mode==='rect'?'bg-accent/20 text-accent':'text-text-muted hover:text-white'}`}><Square className="h-4 w-4"/></button>
               <button onClick={()=>addElement('circle')} className={`p-1.5 rounded ${mode==='circle'?'bg-accent/20 text-accent':'text-text-muted hover:text-white'}`}><Circle className="h-4 w-4"/></button>
               <button onClick={()=>addElement('text')} className={`p-1.5 rounded ${mode==='text'?'bg-accent/20 text-accent':'text-text-muted hover:text-white'}`}><Type className="h-4 w-4"/></button>
            </div>
         </div>
         
         <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4"/> {saving ? 'Saving...' : 'Save'}</Button>
         </div>
      </div>

      {/* Canvas Area */}
      <div 
         className="flex-1 relative overflow-hidden bg-[url('/grid.svg')] bg-repeat opacity-90 cursor-crosshair"
         onMouseMove={onDrag}
         onMouseUp={stopDrag}
         onMouseLeave={stopDrag}
      >
         {elements.map(el => (
            <div 
               key={el.id}
               onMouseDown={(e) => startDrag(e, el.id, el.x, el.y)}
               className="absolute flex items-center justify-center border-2 border-transparent hover:border-accent/50 cursor-move group transition-colors"
               style={{
                  left: el.x,
                  top: el.y,
                  width: el.w,
                  height: el.h,
                  backgroundColor: el.type !== 'text' ? el.color : 'transparent',
                  borderRadius: el.type === 'circle' ? '50%' : '8px'
               }}
            >
               {el.type === 'text' || el.type === 'rect' || el.type === 'circle' ? (
                  <textarea 
                     value={el.text}
                     onChange={(e) => updateElement(el.id, { text: e.target.value })}
                     className="w-full h-full bg-transparent text-center text-white resize-none outline-none overflow-hidden placeholder-white/30"
                     placeholder={el.type === 'text' ? 'Type here...' : ''}
                  />
               ) : null}
               
               {/* Delete button (shows on hover) */}
               <button 
                  onClick={() => deleteElement(el.id)}
                  className="absolute -top-3 -right-3 hidden h-6 w-6 items-center justify-center rounded-full bg-status-danger text-white group-hover:flex"
               >
                  <Trash2 className="h-3 w-3" />
               </button>
            </div>
         ))}
         
         {/* Live Cursors */}
         {Object.entries(cursors).map(([uid, p]) => {
            if (uid === user?.uid || !p.cursor) return null;
            return (
               <div 
                 key={uid} 
                 className="absolute pointer-events-none z-50 flex items-center gap-1 transition-all duration-100 ease-linear"
                 style={{ left: p.cursor.x, top: p.cursor.y }}
               >
                  <MousePointer2 className="w-4 h-4" style={{ color: p.color || '#fff' }} fill={p.color || '#fff'} />
                  <span className="bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: p.color || '#000' }}>
                     {p.name?.split(' ')[0]}
                  </span>
               </div>
            );
         })}
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
         <p className="inline-block rounded-full bg-black/60 px-4 py-1 text-xs text-text-muted backdrop-blur">
            Phase 1 Canvas: Simple objects and dragging supported. More features coming soon.
         </p>
      </div>
    </div>
  );
}
