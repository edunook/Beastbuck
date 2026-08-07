import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Upload, Save, X, CheckCircle2, FileText } from 'lucide-react';
import { AIResearchAssistant } from '@frontend/components/research/AIResearchAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { uploadToPinata } from '@services/storage/pinata';

const RESEARCH_MILESTONES = [
  { id: 'title', label: 'Add a compelling title', completed: false },
  { id: 'abstract', label: 'Write a clear abstract', completed: false },
  { id: 'introduction', label: 'Complete introduction section', completed: false },
  { id: 'methods', label: 'Describe research methods', completed: false },
  { id: 'results', label: 'Present findings and results', completed: false },
  { id: 'discussion', label: 'Add discussion and analysis', completed: false },
  { id: 'citations', label: 'Cite at least 3 papers', completed: false },
  { id: 'attachments', label: 'Attach supporting documents', completed: false },
];

export function ResearchEditor() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('computer-systems');
  const [milestones, setMilestones] = useState(RESEARCH_MILESTONES);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor: currentEditor }) => {
      if (currentEditor && !currentEditor.isDestroyed) {
        const content = currentEditor.getText();
        updateMilestones(content);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 rounded-xl border border-border bg-surface text-white',
      },
    },
  });

  useEffect(() => {
    if (title) {
      setMilestones(prev => prev.map(m => m.id === 'title' ? { ...m, completed: true } : m));
    }
  }, [title]);

  useEffect(() => {
    if (attachments.length > 0) {
      setMilestones(prev => prev.map(m => m.id === 'attachments' ? { ...m, completed: true } : m));
    }
  }, [attachments]);

  const updateMilestones = (content) => {
    const hasAbstract = content.toLowerCase().includes('abstract');
    const hasIntro = content.toLowerCase().includes('introduction');
    const hasMethods = content.toLowerCase().includes('methods');
    const hasResults = content.toLowerCase().includes('results');
    const hasDiscussion = content.toLowerCase().includes('discussion');
    const hasCitations = (content.match(/\[.*?\]/g) || []).length >= 3;

    setMilestones(prev => prev.map(m => {
      if (m.id === 'abstract' && hasAbstract) return { ...m, completed: true };
      if (m.id === 'introduction' && hasIntro) return { ...m, completed: true };
      if (m.id === 'methods' && hasMethods) return { ...m, completed: true };
      if (m.id === 'results' && hasResults) return { ...m, completed: true };
      if (m.id === 'discussion' && hasDiscussion) return { ...m, completed: true };
      if (m.id === 'citations' && hasCitations) return { ...m, completed: true };
      return m;
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const attachmentData = await uploadToPinata(file);
      setAttachments(prev => [...prev, attachmentData]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const progress = (completedMilestones / milestones.length) * 100;
  const xpReward = completedMilestones * 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Research Editor</h1>
          <p className="text-text-muted">Write and collaborate on research papers with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-accent">{completedMilestones}/{milestones.length} Milestones</p>
            <p className="text-xs text-text-muted">{xpReward} XP reward</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Saved</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      {/* Milestone Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition ${
                  milestone.completed 
                    ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                    : 'border-border bg-white/5 text-text-muted'
                }`}
              >
                {milestone.completed ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-current" />}
                <span className="text-xs font-medium">{milestone.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Split-Screen Editor */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Pane - Document Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Document Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Research paper title..."
                className="text-lg font-bold"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="space-science">Space Science</option>
                <option value="computer-systems">Computer Systems</option>
                <option value="genetics">Genetics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="physics">Physics</option>
              </select>
              {editor && <EditorContent editor={editor} />}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-accent" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-white">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <Button size="sm" variant="secondary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add Attachment'}
                </Button>
              </label>
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-white">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-text-muted hover:text-status-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - AI Assistant */}
        <div className="lg:col-span-1">
          <AIResearchAssistant 
            paperText={editor?.getText() || ''} 
            onCitationGenerated={(citation) => {
              if (editor) {
                editor.chain().focus().insertContent(`\n\n${citation}\n\n`).run();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
