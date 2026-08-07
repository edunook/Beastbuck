import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Save, Upload, X } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { Card, CardContent, CardHeader } from '@frontend/components/ui/Card';
import { AIResearchAssistant } from '@frontend/components/research/AIResearchAssistant';
import { uploadToPinata } from '@services/storage/pinata';

export function AICoAuthorEditor() {
  const [title, setTitle] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: documentText,
    onUpdate: ({ editor: currentEditor }) => {
      if (currentEditor && !currentEditor.isDestroyed) {
        setDocumentText(currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 rounded-xl border border-border bg-surface text-white',
      },
    },
  });

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToPinata(file));
      const results = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...results]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // In production, save to Firestore
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Co-Author Editor</h1>
          <p className="text-text-muted">Write your research paper with AI assistance</p>
        </div>
        <Button onClick={handleSave} disabled={!title}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Saved!' : 'Save Draft'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px] h-[calc(100%-4rem)]">
        {/* Left Panel - Document Editor */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper Title"
              className="w-full text-xl font-bold text-white bg-transparent border-none outline-none placeholder-text-muted"
            />
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <EditorContent editor={editor} />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Attachments</h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-accent hover:underline">
                  <Upload className="h-3 w-3" />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.csv"
                  />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border bg-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">📎</span>
                        <span className="text-sm text-white truncate">{attachment.name}</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-text-muted hover:text-status-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - AI Assistant */}
        <AIResearchAssistant 
          paperText={documentText.replace(/<[^>]*>/g, '')} 
          onCitationGenerated={(citation) => {
            if (editor) {
              editor.chain().focus().insertContent(citation).run();
            }
          }}
        />
      </div>
    </div>
  );
}
