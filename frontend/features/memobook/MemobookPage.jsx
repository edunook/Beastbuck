import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { MemobookService } from '@services/firestore/memobook';
import { MembershipService } from '@services/firestore/membership';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardHeader, CardTitle, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import {
  BookOpen,
  Plus,
  ChevronRight,
  FileText,
  Clock,
  X,
  Save,
  ArrowLeft,
  Bold,
  Italic,
  Trash2,
  Palette,
  Type,
  Sparkles,
  Lock,
  Globe,
  Users,
  Eye,
  Edit3,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './MemobookPage.css';

const DEFAULT_BG = '#ffffff';
const DEFAULT_TEXT = '#000000';

// Preset Color Palettes
const COLOR_PRESETS = [
  { name: 'Paper White',    bg: '#ffffff', text: '#000000' },
  { name: 'Dark Surface',   bg: '#121826', text: '#f8fafc' },
  { name: 'Cyber Cyan',     bg: '#090d16', text: '#38bdf8' },
  { name: 'Obsidian Black', bg: '#000000', text: '#ffffff' },
  { name: 'Royal Indigo',   bg: '#1e1b4b', text: '#e0e7ff' },
  { name: 'Emerald Forest', bg: '#062c1b', text: '#a7f3d0' },
  { name: 'Sunset Amber',   bg: '#2a1708', text: '#fde68a' },
  { name: 'Sepia Vintage',  bg: '#fef3c7', text: '#78350f' },
];

// ─── Visibility Badge ────────────────────────────────────────────────────────
const VisibilityBadge = ({ visibility, allowCollabEdit, small = false }) => {
  if (visibility === 'public' && allowCollabEdit) {
    return (
      <span className={`visibility-badge badge-public-edit ${small ? 'badge-sm' : ''}`}>
        <Edit3 className="w-3 h-3" /> Public · Editable
      </span>
    );
  }
  if (visibility === 'public') {
    return (
      <span className={`visibility-badge badge-public-read ${small ? 'badge-sm' : ''}`}>
        <Globe className="w-3 h-3" /> Public · Read-only
      </span>
    );
  }
  return (
    <span className={`visibility-badge badge-private ${small ? 'badge-sm' : ''}`}>
      <Lock className="w-3 h-3" /> Private
    </span>
  );
};

// ─── Visibility Toggle Control ────────────────────────────────────────────────
const VisibilityControl = ({ visibility, allowCollabEdit, onVisibilityChange, onCollabChange }) => (
  <div className="visibility-control">
    {/* Private / Public pill toggle */}
    <div className="pill-toggle-group">
      <button
        type="button"
        className={`pill-btn ${visibility === 'private' ? 'pill-active-private' : ''}`}
        onClick={() => onVisibilityChange('private')}
      >
        <Lock className="w-3.5 h-3.5" />
        Private
      </button>
      <button
        type="button"
        className={`pill-btn ${visibility === 'public' ? 'pill-active-public' : ''}`}
        onClick={() => onVisibilityChange('public')}
      >
        <Globe className="w-3.5 h-3.5" />
        Public
      </button>
    </div>

    {/* Allow-edit sub-toggle — visible only when public */}
    {visibility === 'public' && (
      <div className="collab-toggle-row">
        <div className="collab-toggle-label">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-text-muted">Allow others to edit</span>
        </div>
        <button
          type="button"
          className={`toggle-switch ${allowCollabEdit ? 'toggle-on' : 'toggle-off'}`}
          onClick={() => onCollabChange(!allowCollabEdit)}
          aria-label="Toggle collaborative editing"
        >
          <span className="toggle-thumb" />
        </button>
      </div>
    )}
  </div>
);

// ─── Stable Editor Toolbar ────────────────────────────────────────────────────
const EditorToolbar = memo(({
  editor,
  selectedBgColor,
  setSelectedBgColor,
  selectedTextColor,
  setSelectedTextColor,
  applyPresetTheme,
  isOwner,
  visibility,
  allowCollabEdit,
  onVisibilityChange,
  onCollabChange,
}) => {
  if (!editor) return null;

  return (
    <div className="editor-menu-bar flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/80 border-b border-white/10 rounded-t-xl">
      {/* Format buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`menu-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      {/* Color Customization */}
      <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
        {/* Background Color */}
        <div
          className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-lg border border-white/15"
          title="Change Background Color"
          onClick={(e) => e.stopPropagation()}
        >
          <Palette className="w-4 h-4 text-accent" />
          <span className="text-xs text-text-muted font-medium">BG:</span>
          <input
            type="color"
            value={selectedBgColor}
            onChange={(e) => setSelectedBgColor(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {/* Text Color */}
        <div
          className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-lg border border-white/15"
          title="Change Text Color"
          onClick={(e) => e.stopPropagation()}
        >
          <Type className="w-4 h-4 text-accent" />
          <span className="text-xs text-text-muted font-medium">Text:</span>
          <input
            type="color"
            value={selectedTextColor}
            onChange={(e) => setSelectedTextColor(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {/* Preset dots */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar scrollbar-none py-0.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPresetTheme(preset)}
              className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-125 shadow-sm"
              style={{ backgroundColor: preset.bg, color: preset.text }}
              title={`${preset.name}`}
            >
              <span className="block text-[9px] font-bold text-center">T</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visibility quick-toggle — owner only */}
      {isOwner && (
        <div className="toolbar-visibility" onClick={(e) => e.stopPropagation()}>
          <VisibilityControl
            visibility={visibility}
            allowCollabEdit={allowCollabEdit}
            onVisibilityChange={onVisibilityChange}
            onCollabChange={onCollabChange}
          />
        </div>
      )}
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const MemobookPage = () => {
  const { user, roleData } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memobooks, setMemobooks] = useState([]);
  const [publicMemobooks, setPublicMemobooks] = useState([]);
  const [selectedMemobook, setSelectedMemobook] = useState(null);
  const [showCreateMemobook, setShowCreateMemobook] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor'
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'public'

  // Editor session colors
  const [selectedBgColor, setSelectedBgColor] = useState(DEFAULT_BG);
  const [selectedTextColor, setSelectedTextColor] = useState(DEFAULT_TEXT);

  // Visibility for editor session (live state, synced with save)
  const [editorVisibility, setEditorVisibility] = useState('private');
  const [editorCollabEdit, setEditorCollabEdit] = useState(false);

  // Create form
  const [memobookForm, setMemobookForm] = useState({
    title: '',
    bgColor: DEFAULT_BG,
    textColor: DEFAULT_TEXT,
    visibility: 'private',
    allowCollabEdit: false,
  });

  // Is the current user the owner of the selected memobook?
  const isOwner = selectedMemobook?.createdBy === user?.uid;

  // Can the current user edit the selected memobook?
  const canEdit = isOwner || (
    selectedMemobook?.visibility === 'public' &&
    selectedMemobook?.allowCollabEdit === true
  );

  // Rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: canEdit,
  });

  // Keep editor.editable in sync when selectedMemobook changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor, selectedMemobook]);

  useEffect(() => {
    checkMembership();
  }, [user, roleData]);

  useEffect(() => {
    if (isMember && user) {
      const unsub1 = loadMemobooks();
      const unsub2 = loadPublicMemobooks();
      return () => {
        unsub1?.();
        unsub2?.();
      };
    }
  }, [isMember, user]);

  useEffect(() => {
    if (selectedMemobook && editor) {
      editor.commands.setContent(selectedMemobook.content || '');
      setSelectedBgColor(selectedMemobook.bgColor || DEFAULT_BG);
      setSelectedTextColor(selectedMemobook.textColor || DEFAULT_TEXT);
      setEditorVisibility(selectedMemobook.visibility || 'private');
      setEditorCollabEdit(selectedMemobook.allowCollabEdit ?? false);
    }
  }, [selectedMemobook, editor]);

  const checkMembership = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const member = await MembershipService.isApprovedMember(user.uid);
      setIsMember(member);
    } catch (err) {
      console.error('Error checking membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemobooks = () => {
    if (!user) return;
    return MemobookService.subscribeToMemobooks(user.uid, setMemobooks);
  };

  const loadPublicMemobooks = () => {
    return MemobookService.subscribeToPublicMemobooks(setPublicMemobooks);
  };

  const handleCreateMemobook = async (e) => {
    e.preventDefault();
    if (!memobookForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      const memobookId = await MemobookService.createMemobook(user.uid, {
        title: memobookForm.title,
        description: '',
        content: '',
        bgColor: memobookForm.bgColor,
        textColor: memobookForm.textColor,
        visibility: memobookForm.visibility,
        allowCollabEdit: memobookForm.visibility === 'public' ? memobookForm.allowCollabEdit : false,
        createdByName: user.displayName || user.email || 'Member',
      });
      toast.success('Memobook created!');
      const newMemobook = {
        id: memobookId,
        title: memobookForm.title,
        content: '',
        bgColor: memobookForm.bgColor,
        textColor: memobookForm.textColor,
        visibility: memobookForm.visibility,
        allowCollabEdit: memobookForm.allowCollabEdit,
        createdBy: user.uid,
        createdByName: user.displayName || user.email || 'Member',
      };
      setMemobookForm({ title: '', bgColor: DEFAULT_BG, textColor: DEFAULT_TEXT, visibility: 'private', allowCollabEdit: false });
      setShowCreateMemobook(false);
      setSelectedMemobook(newMemobook);
      setSelectedBgColor(newMemobook.bgColor);
      setSelectedTextColor(newMemobook.textColor);
      setEditorVisibility(newMemobook.visibility);
      setEditorCollabEdit(newMemobook.allowCollabEdit);
      setViewMode('editor');
    } catch (err) {
      toast.error('Failed to create memobook');
      console.error(err);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedMemobook || !editor) return;
    try {
      const content = editor.getHTML();
      const updates = {
        content,
        bgColor: selectedBgColor,
        textColor: selectedTextColor,
        ...(isOwner ? {
          visibility: editorVisibility,
          allowCollabEdit: editorVisibility === 'public' ? editorCollabEdit : false,
        } : {}),
      };
      await MemobookService.updateMemobook(selectedMemobook.id, updates);
      setSelectedMemobook(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Memobook saved!');
    } catch (err) {
      toast.error('Failed to save memobook');
      console.error(err);
    }
  };

  // Owner quickly toggles visibility from the toolbar — saves immediately
  const handleToolbarVisibilityChange = async (newVisibility) => {
    const wasPrivate = editorVisibility === 'private';
    setEditorVisibility(newVisibility);
    if (newVisibility === 'private') setEditorCollabEdit(false);
    if (!selectedMemobook) return;
    try {
      // Notify all members only when switching private → public
      const shouldNotify = wasPrivate && newVisibility === 'public';
      await MemobookService.updateMemobook(
        selectedMemobook.id,
        {
          visibility: newVisibility,
          allowCollabEdit: newVisibility === 'public' ? editorCollabEdit : false,
        },
        {
          notifyIfPublic: shouldNotify,
          authorName: user?.displayName || user?.email || 'A member',
          authorUid: user?.uid,
          title: selectedMemobook.title,
        }
      );
      setSelectedMemobook(prev => prev ? {
        ...prev,
        visibility: newVisibility,
        allowCollabEdit: newVisibility === 'public' ? editorCollabEdit : false,
      } : null);
      toast.success(`Memobook is now ${newVisibility === 'public' ? '🌐 Public' : '🔒 Private'}`);
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  const handleToolbarCollabChange = async (newCollab) => {
    setEditorCollabEdit(newCollab);
    if (!selectedMemobook) return;
    try {
      await MemobookService.updateMemobook(selectedMemobook.id, { allowCollabEdit: newCollab });
      setSelectedMemobook(prev => prev ? { ...prev, allowCollabEdit: newCollab } : null);
      toast.success(newCollab ? 'Others can now edit this memobook' : 'Editing restricted to owner');
    } catch (err) {
      toast.error('Failed to update edit permission');
    }
  };

  const handleDeleteMemobook = async (memobookId) => {
    if (!confirm('Are you sure you want to delete this memobook?')) return;
    try {
      await MemobookService.deleteMemobook(memobookId);
      toast.success('Memobook deleted!');
      if (selectedMemobook?.id === memobookId) {
        setSelectedMemobook(null);
        setViewMode('list');
      }
    } catch (err) {
      toast.error('Failed to delete memobook');
    }
  };

  const handleOpenMemobook = (memobook) => {
    setSelectedMemobook(memobook);
    setSelectedBgColor(memobook.bgColor || DEFAULT_BG);
    setSelectedTextColor(memobook.textColor || DEFAULT_TEXT);
    setEditorVisibility(memobook.visibility || 'private');
    setEditorCollabEdit(memobook.allowCollabEdit ?? false);
    setViewMode('editor');
  };

  const handleBackToList = () => {
    setSelectedMemobook(null);
    setViewMode('list');
  };

  const applyPresetTheme = useCallback((preset) => {
    setSelectedBgColor(preset.bg);
    setSelectedTextColor(preset.text);
    toast.success(`Theme "${preset.name}" applied`);
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </PageContainer>
    );
  }

  if (!isMember) {
    return (
      <PageContainer>
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Membership Required</h2>
              <p className="text-text-muted">
                You need to be an approved member to access Memobooks.
              </p>
            </div>
            <Button variant="primary" onClick={() => window.location.href = '/membership/apply'}>
              Apply for Membership
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // ── Memobook Card (shared between "Mine" and "Public" tabs) ──────────────
  const MemobookCard = ({ memobook, showAuthor = false }) => {
    const cardBg = memobook.bgColor || DEFAULT_BG;
    const cardText = memobook.textColor || DEFAULT_TEXT;
    const own = memobook.createdBy === user?.uid;

    return (
      <div
        className="memobook-card group relative rounded-2xl border border-white/10 p-5 transition-all duration-300 hover:scale-[1.02] shadow-xl cursor-pointer"
        style={{ backgroundColor: cardBg, color: cardText }}
        onClick={() => handleOpenMemobook(memobook)}
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/10 shadow"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: cardText }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <VisibilityBadge
              visibility={memobook.visibility || 'private'}
              allowCollabEdit={memobook.allowCollabEdit}
              small
            />
            {own && (
              <button
                type="button"
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleDeleteMemobook(memobook.id); }}
                title="Delete memobook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h4 className="text-lg font-bold truncate mb-1" style={{ color: cardText }}>
          {memobook.title}
        </h4>

        {showAuthor && memobook.createdByName && (
          <p className="text-xs opacity-70 flex items-center gap-1 mb-1" style={{ color: cardText }}>
            <User className="w-3 h-3" />
            {memobook.createdByName}
          </p>
        )}

        <div
          className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-black/10 opacity-80"
          style={{ color: cardText }}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {memobook.updatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      <div className="memobook-page">

        {viewMode === 'list' ? (
          <>
            <PageHeader
              title="Memobook Studio"
              subtitle="Create notes with custom colors. Share publicly or keep private."
              icon={<BookOpen className="w-8 h-8 text-accent" />}
            />

            {/* Tab switcher */}
            <div className="memobook-tabs">
              <button
                className={`tab-btn ${activeTab === 'mine' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('mine')}
              >
                <FileText className="w-4 h-4" />
                My Memobooks
                <span className="tab-count">{memobooks.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'public' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('public')}
              >
                <Globe className="w-4 h-4" />
                Public Feed
                <span className="tab-count">{publicMemobooks.length}</span>
              </button>
            </div>

            {/* MY memobooks */}
            {activeTab === 'mine' && (
              <div className="memobook-list-view">
                <div className="memobook-list-header">
                  <h3 className="list-title">My Memobooks</h3>
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateMemobook(true)}
                    className="create-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create New Memobook</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>

                <div className="memobooks-grid">
                  {memobooks.length === 0 ? (
                    <div className="empty-state">
                      <FileText className="w-16 h-16 text-text-muted/30" />
                      <h3 className="empty-title">No memobooks yet</h3>
                      <p className="empty-description">Create your first memobook to get started</p>
                    </div>
                  ) : (
                    memobooks.map((m) => <MemobookCard key={m.id} memobook={m} />)
                  )}
                </div>
              </div>
            )}

            {/* PUBLIC feed */}
            {activeTab === 'public' && (
              <div className="memobook-list-view">
                <div className="memobook-list-header">
                  <h3 className="list-title">Public Memobooks</h3>
                  <span className="text-sm text-text-muted">Shared by all members</span>
                </div>

                <div className="memobooks-grid">
                  {publicMemobooks.length === 0 ? (
                    <div className="empty-state">
                      <Globe className="w-16 h-16 text-text-muted/30" />
                      <h3 className="empty-title">No public memobooks yet</h3>
                      <p className="empty-description">Be the first to share one!</p>
                    </div>
                  ) : (
                    publicMemobooks.map((m) => (
                      <MemobookCard key={m.id} memobook={m} showAuthor />
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Editor View ─────────────────────────────────────────────── */
          <div className="memobook-editor-view max-w-5xl mx-auto space-y-4">
            {/* Header bar */}
            <div className="editor-header flex flex-wrap items-center justify-between gap-3 p-4 bg-surface/60 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleBackToList} className="back-btn">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {selectedMemobook?.title}
                    </h2>
                    <VisibilityBadge
                      visibility={editorVisibility}
                      allowCollabEdit={editorCollabEdit}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {/* Author chip */}
                    <span className="author-chip">
                      <User className="w-3 h-3" />
                      {isOwner ? 'Your memobook' : `By ${selectedMemobook?.createdByName || 'Member'}`}
                    </span>
                    {/* Status */}
                    <span className="text-xs text-text-muted">
                      {isOwner
                        ? `Saved ${selectedMemobook?.updatedAt?.toDate?.()?.toLocaleString() || 'just now'}`
                        : canEdit ? '✏️ You can edit' : '👁️ Read-only'
                      }
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!canEdit && (
                  <span className="readonly-banner">
                    <Eye className="w-4 h-4" />
                    Read-only
                  </span>
                )}
                {isOwner && (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMemobook(selectedMemobook?.id)}
                    className="delete-btn h-9 text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="primary"
                    onClick={handleSaveContent}
                    className="save-btn h-9 text-xs"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            {/* Editor area */}
            <div
              className="editor-container rounded-2xl border border-white/15 overflow-hidden shadow-2xl transition-all duration-300"
              style={{ backgroundColor: selectedBgColor, color: selectedTextColor }}
            >
              <EditorToolbar
                editor={editor}
                selectedBgColor={selectedBgColor}
                setSelectedBgColor={setSelectedBgColor}
                selectedTextColor={selectedTextColor}
                setSelectedTextColor={setSelectedTextColor}
                applyPresetTheme={applyPresetTheme}
                isOwner={isOwner}
                visibility={editorVisibility}
                allowCollabEdit={editorCollabEdit}
                onVisibilityChange={handleToolbarVisibilityChange}
                onCollabChange={handleToolbarCollabChange}
              />
              <div
                className={`editor-content p-6 sm:p-8 min-h-[500px] ${!canEdit ? 'editor-readonly' : ''}`}
                style={{ backgroundColor: selectedBgColor, color: selectedTextColor }}
              >
                <style>{`
                  .ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
                  .ProseMirror li, .ProseMirror blockquote {
                    color: ${selectedTextColor} !important;
                  }
                `}</style>
                <EditorContent editor={editor} />
                {!canEdit && (
                  <div className="readonly-overlay">
                    <Eye className="w-5 h-5" />
                    <span>This memobook is read-only</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Create Modal ──────────────────────────────────────────────── */}
        {showCreateMemobook && (
          <div className="modal-overlay" onClick={() => setShowCreateMemobook(false)}>
            <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="modal-header">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Create New Memobook
                  </CardTitle>
                  <button className="modal-close" onClick={() => setShowCreateMemobook(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMemobook} className="modal-form space-y-4">
                  {/* Title */}
                  <div className="form-group">
                    <label className="form-label font-bold text-sm text-white">Title *</label>
                    <input
                      type="text"
                      className="form-input w-full p-3 bg-background border border-white/10 rounded-xl text-white outline-none focus:border-accent"
                      placeholder="My Memobook Title..."
                      value={memobookForm.title}
                      onChange={(e) => setMemobookForm({ ...memobookForm, title: e.target.value })}
                      autoFocus
                    />
                  </div>

                  {/* Visibility */}
                  <div className="form-group">
                    <label className="form-label font-bold text-xs text-text-muted mb-1 block">
                      Visibility
                    </label>
                    <VisibilityControl
                      visibility={memobookForm.visibility}
                      allowCollabEdit={memobookForm.allowCollabEdit}
                      onVisibilityChange={(v) => setMemobookForm({ ...memobookForm, visibility: v, allowCollabEdit: v === 'private' ? false : memobookForm.allowCollabEdit })}
                      onCollabChange={(c) => setMemobookForm({ ...memobookForm, allowCollabEdit: c })}
                    />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="form-label font-bold text-xs text-text-muted mb-1 block">Background Color</label>
                      <div className="flex items-center gap-2 bg-background p-2 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={memobookForm.bgColor}
                          onChange={(e) => setMemobookForm({ ...memobookForm, bgColor: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs text-white uppercase font-mono">{memobookForm.bgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="form-label font-bold text-xs text-text-muted mb-1 block">Text Color</label>
                      <div className="flex items-center gap-2 bg-background p-2 rounded-xl border border-white/10">
                        <input
                          type="color"
                          value={memobookForm.textColor}
                          onChange={(e) => setMemobookForm({ ...memobookForm, textColor: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs text-white uppercase font-mono">{memobookForm.textColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset themes */}
                  <div>
                    <label className="form-label font-bold text-xs text-text-muted mb-1.5 block">Quick Preset Themes</label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setMemobookForm({ ...memobookForm, bgColor: preset.bg, textColor: preset.text })}
                          className="p-2 rounded-lg border text-center transition-transform hover:scale-105"
                          style={{ backgroundColor: preset.bg, borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <span className="text-[10px] font-bold block" style={{ color: preset.text }}>
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="modal-actions pt-3 flex justify-end gap-2 border-t border-white/10">
                    <Button variant="ghost" onClick={() => setShowCreateMemobook(false)}>Cancel</Button>
                    <Button variant="primary" type="submit">
                      <Plus className="w-4 h-4 mr-1" />
                      Create & Open
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default MemobookPage;