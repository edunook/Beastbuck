import { useState } from 'react';
import { Plus, Save, Image, FileText, Link, Mic, PenTool, Layers, Grid } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ResearchNotebook() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Climate Change Research Notes',
      content: 'Key findings from recent studies on global warming patterns...',
      type: 'text',
      createdAt: '2024-06-15',
    },
    {
      id: 2,
      title: 'AI Model Experiments',
      content: 'Results from neural network training experiments...',
      type: 'text',
      createdAt: '2024-06-10',
    },
  ]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', type: 'text' });

  const handleSave = () => {
    if (!newNote.title.trim()) return;
    setNotes([
      {
        id: Date.now(),
        ...newNote,
        createdAt: new Date().toISOString().split('T')[0],
      },
      ...notes,
    ]);
    setNewNote({ title: '', content: '', type: 'text' });
    setShowNewNote(false);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Notebook" 
        description="Store notes, files, and ideas for your research."
        hero={true}
        action={
          <Button onClick={() => setShowNewNote(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <PenTool className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Notes</span>
            </div>
            <p className="text-text-muted text-sm">Text notes and ideas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Image className="h-6 w-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">Media</span>
            </div>
            <p className="text-text-muted text-sm">Images and videos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Files</span>
            </div>
            <p className="text-text-muted text-sm">PDFs, documents, and more</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} className="cursor-pointer hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{note.title}</h3>
                  <p className="text-text-muted text-xs">{note.createdAt}</p>
                </div>
              </div>
              <p className="text-text-soft text-sm line-clamp-2">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notebook Features Info */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <PenTool className="h-5 w-5 text-purple-400" />
              <span className="text-white text-sm">Notes</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Image className="h-5 w-5 text-cyan-400" />
              <span className="text-white text-sm">Images</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Mic className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm">Voice Notes</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span className="text-white text-sm">PDFs</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Link className="h-5 w-5 text-pink-400" />
              <span className="text-white text-sm">Links</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Grid className="h-5 w-5 text-blue-400" />
              <span className="text-white text-sm">Mind Maps</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Layers className="h-5 w-5 text-orange-400" />
              <span className="text-white text-sm">Drawings</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Save className="h-5 w-5 text-accent" />
              <span className="text-white text-sm">Autosave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewNote(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">New Note</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note content"
                  rows={4}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowNewNote(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
