import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { MemobookService } from '@services/firestore/memobook';
import { MembershipService } from '@services/firestore/membership';
import { PERMISSIONS } from '@shared/permissions/permissions';
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
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './MemobookPage.css';

const MemobookPage = () => {
  const { user, roleData } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memobooks, setMemobooks] = useState([]);
  const [selectedMemobook, setSelectedMemobook] = useState(null);
  const [showCreateMemobook, setShowCreateMemobook] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'editor'
  
  // Form states
  const [memobookForm, setMemobookForm] = useState({ title: '' });

  // Rich text editor
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '',
    editable: true,
    onUpdate: ({ editor }) => {
      // Content updated automatically
    },
  });

  useEffect(() => {
    checkMembership();
  }, [user, roleData]);

  useEffect(() => {
    if (isMember && user) {
      loadMemobooks();
    }
  }, [isMember, user]);

  useEffect(() => {
    if (selectedMemobook && editor) {
      editor.commands.setContent(selectedMemobook.content || '');
    }
  }, [selectedMemobook, editor]);

  const checkMembership = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
    
    const unsubscribe = MemobookService.subscribeToMemobooks(user.uid, (data) => {
      setMemobooks(data);
    });
    
    return () => unsubscribe();
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
      });
      toast.success('Memobook created successfully!');
      setMemobookForm({ title: '' });
      setShowCreateMemobook(false);
      
      // Navigate to the new memobook
      const newMemobook = { id: memobookId, title: memobookForm.title, content: '' };
      setSelectedMemobook(newMemobook);
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
      await MemobookService.updateMemobook(selectedMemobook.id, {
        content: content,
      });
      toast.success('Content saved successfully!');
    } catch (err) {
      toast.error('Failed to save content');
      console.error(err);
    }
  };

  const handleDeleteMemobook = async (memobookId) => {
    if (!confirm('Are you sure you want to delete this memobook?')) {
      return;
    }

    try {
      await MemobookService.deleteMemobook(memobookId);
      toast.success('Memobook deleted successfully!');
      if (selectedMemobook?.id === memobookId) {
        setSelectedMemobook(null);
        setViewMode('list');
      }
    } catch (err) {
      toast.error('Failed to delete memobook');
      console.error(err);
    }
  };

  const handleBackToList = () => {
    setSelectedMemobook(null);
    setViewMode('list');
  };

  const handleOpenMemobook = (memobook) => {
    setSelectedMemobook(memobook);
    setViewMode('editor');
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="editor-menu-bar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`menu-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>
    );
  };

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
                You need to be an approved member to access Memobooks. Apply for membership to unlock this feature!
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

  return (
    <PageContainer>
      <div className="memobook-page">
        {viewMode === 'list' ? (
          <>
            <PageHeader
              title="Memobook"
              subtitle="Create and organize your notes and ideas"
              icon={<BookOpen className="w-8 h-8" />}
            />

            <div className="memobook-list-view">
              <div className="memobook-list-header">
                <h3 className="list-title">My Memobooks</h3>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateMemobook(true)}
                  className="create-btn"
                >
                  <Plus className="w-4 h-4" />
                  Create New Memobook
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
                  memobooks.map((memobook) => (
                    <Card
                      key={memobook.id}
                      className="memobook-card"
                      hoverable
                      onClick={() => handleOpenMemobook(memobook)}
                    >
                      <CardContent className="memobook-card-content">
                        <div className="memobook-card-header">
                          <div className="memobook-card-icon">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <h4 className="memobook-card-title">{memobook.title}</h4>
                        </div>
                        <div className="memobook-card-footer">
                          <Clock className="w-4 h-4 text-text-muted/60" />
                          <span className="memobook-card-date">
                            {memobook.updatedAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                          </span>
                          <button
                            className="memobook-card-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this memobook?')) {
                                handleDeleteMemobook(memobook.id);
                              }
                            }}
                            title="Delete memobook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-text-muted/60 ml-auto" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Editor View */}
            <div className="memobook-editor-view">
              <div className="editor-header">
                <div className="editor-header-left">
                  <Button
                    variant="ghost"
                    onClick={handleBackToList}
                    className="back-btn"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <div className="editor-title-section">
                    <h2 className="editor-title">{selectedMemobook?.title}</h2>
                    <p className="editor-subtitle">Last edited: {selectedMemobook?.updatedAt?.toDate?.()?.toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="editor-header-right">
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this memobook? This action cannot be undone.')) {
                        handleDeleteMemobook(selectedMemobook.id);
                      }
                    }}
                    className="delete-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveContent}
                    className="save-btn"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="editor-container">
                <MenuBar />
                <div className="editor-content">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create Memobook Modal */}
        {showCreateMemobook && (
          <div className="modal-overlay" onClick={() => setShowCreateMemobook(false)}>
            <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="modal-header">
                  <CardTitle>Create New Memobook</CardTitle>
                  <button
                    className="modal-close"
                    onClick={() => setShowCreateMemobook(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMemobook} className="modal-form">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="My Awesome Memobook"
                      value={memobookForm.title}
                      onChange={(e) => setMemobookForm({ title: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="modal-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCreateMemobook(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      <Plus className="w-4 h-4" />
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