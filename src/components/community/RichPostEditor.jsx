import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { Bold, Italic, Code, List, Heading1, Heading2, Heading3, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export function RichPostEditor({ content, onChange, placeholder = 'Write your post...' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 rounded-xl border border-border bg-surface text-white',
      },
    },
  });

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-white/5 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded ${editor.isActive('code') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded text-white hover:bg-white/10"
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded ${editor.isActive('link') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      
      {showLinkInput && (
        <div className="flex gap-2 border-b border-border bg-white/5 p-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-border bg-black/30 px-3 py-1.5 text-sm text-white outline-none focus:border-accent"
          />
          <button
            onClick={addLink}
            className="px-3 py-1.5 rounded-lg bg-accent text-black text-sm font-bold"
          >
            Add
          </button>
        </div>
      )}
      
      <EditorContent editor={editor} />
    </div>
  );
}
