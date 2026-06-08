import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, Eye, FileText, Heart, MessageSquare, Pencil, Star, Trash2, Users, Video, FolderKanban } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { hasPermission } from '../../services/firebase/permissions';
import { ExperimentsService } from '../../services/firebase/experiments';
import { EXPERIMENT_CATEGORIES, EXPERIMENT_DIFFICULTIES, EXPERIMENT_STATUSES } from '../../services/firebase/experiments';
import { UsersService } from '../../services/firebase/users';
import { isCloudinaryConfigured, uploadExperimentMedia } from '../../services/cloudinary/uploads';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function textBlock(value, empty = 'Not documented yet.') {
  return <p className="whitespace-pre-wrap text-sm leading-7 text-text-soft">{value || empty}</p>;
}

function MediaItem({ item }) {
  if (item.type === 'image') {
    return <img src={item.url} alt={item.name || ''} className="h-56 w-full rounded-xl object-cover" />;
  }

  if (item.type === 'video') {
    return <video src={item.url} controls className="h-56 w-full rounded-xl bg-black object-contain" />;
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="flex min-h-32 items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-4 text-text-soft hover:text-white">
      <FileText className="h-6 w-6 text-accent" />
      <span className="min-w-0 truncate">{item.name || 'Document'}</span>
    </a>
  );
}

export default function ExperimentDetail() {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [experiment, setExperiment] = useState(null);
  const [comments, setComments] = useState([]);
  const [members, setMembers] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isOwner = user?.uid && experiment?.authorId === user.uid;
  const likes = Array.isArray(experiment?.likes) ? experiment.likes : [];
  const hasLiked = likes.includes(user?.uid);

  const teamIds = Array.isArray(experiment?.teamMembers) ? experiment.teamMembers : [];
  const teamMembers = teamIds.map(id => members.find(member => member.id === id)).filter(Boolean);

  useEffect(() => {
    if (!experimentId) return undefined;
    ExperimentsService.incrementViews(experimentId).catch((err) => console.error('Experiment view failed:', err));

    const unsubscribe = ExperimentsService.subscribeToExperiment(experimentId, {
      onExperiment: (nextExperiment) => {
        setExperiment(nextExperiment);
        if (nextExperiment && !editing) {
          setEditForm({
            title: nextExperiment.title || '',
            description: nextExperiment.description || '',
            category: nextExperiment.category || 'Invention',
            difficulty: nextExperiment.difficulty || 'Beginner',
            status: nextExperiment.status || 'PLANNING',
            teamMembers: nextExperiment.teamMembers || [],
            media: nextExperiment.media || [],
            materials: nextExperiment.materials || '',
            procedure: nextExperiment.procedure || '',
            results: nextExperiment.results || '',
            lessonsLearned: nextExperiment.lessonsLearned || '',
          });
        }
        setLoading(false);
      },
      onError: (err) => {
        console.error('Experiment listener failed:', err);
        setError('Could not load this experiment.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [editing, experimentId]);

  useEffect(() => {
    if (!experimentId) return undefined;
    return ExperimentsService.subscribeToComments(experimentId, {
      onComments: setComments,
      onError: (err) => console.error('Experiment comments failed:', err),
    });
  }, [experimentId]);

  useEffect(() => {
    UsersService.getAssignableMembers().then(setMembers).catch((err) => console.error('Experiment members failed:', err));
  }, []);

  const toggleLike = async () => {
    if (!user?.uid) return;
    await ExperimentsService.toggleLike(experimentId, user.uid, hasLiked);
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    await ExperimentsService.addComment(experimentId, {
      authorId: user.uid,
      authorName: roleData?.displayName || roleData?.username || user.displayName || 'Member',
      text: commentText,
    });
    setCommentText('');
  };

  const archiveExperiment = async () => {
    await ExperimentsService.archiveExperiment(experimentId);
  };

  const deleteExperiment = async () => {
    await ExperimentsService.deleteExperiment(experimentId);
    navigate('/workspace/experiments');
  };

  const featureExperiment = async () => {
    await ExperimentsService.featureExperiment(experimentId, !experiment.featured);
  };

  const handleWorkspaceAction = async () => {
    if (experiment.workspaceId) {
       navigate(`/workspace/${experiment.workspaceId}`);
       return;
    }
    
    // Create new workspace
    setSaving(true);
    try {
       const newWs = await import('../../services/firebase/workspace').then(m => m.WorkspaceService.createWorkspace({
          name: `${experiment.title} Workspace`,
          description: `Dedicated workspace for experiment: ${experiment.title}`
       }, user.uid));
       
       await ExperimentsService.updateExperiment(experimentId, { workspaceId: newWs.id });
       navigate(`/workspace/${newWs.id}`);
    } catch (err) {
       console.error("Workspace creation failed:", err);
       setError("Failed to create workspace.");
    } finally {
       setSaving(false);
    }
  };

  const deleteComment = async (commentId) => {
    await ExperimentsService.deleteComment(experimentId, commentId);
  };

  const saveEdits = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await ExperimentsService.updateExperiment(experimentId, editForm);
      setEditing(false);
    } catch (err) {
      console.error('Experiment edit failed:', err);
      setError('Experiment could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const updateEditField = (field, value) => {
    setEditForm(current => ({ ...current, [field]: value }));
  };

  const uploadEditMedia = async (files) => {
    if (!files.length || !isCloudinaryConfigured) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadExperimentMedia(file)));
      updateEditField('media', [...(editForm.media || []), ...uploaded]);
    } catch (err) {
      console.error('Experiment edit media upload failed:', err);
      setError('Media upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoadingState text="Loading experiment..." /></div>;
  }

  if (!experiment) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Experiment not found</h1>
          <p className="mt-2 text-sm text-text-muted">This lab record is missing or archived.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="ghost" onClick={() => navigate('/workspace/experiments')} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lab
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleWorkspaceAction} disabled={saving}>
             <FolderKanban className="mr-2 h-4 w-4" /> 
             {experiment.workspaceId ? 'Open Workspace' : 'Create Workspace'}
          </Button>
          <Button variant="secondary" onClick={toggleLike}>
            <Heart className={`mr-2 h-4 w-4 ${hasLiked ? 'fill-current text-status-danger' : ''}`} /> {likes.length}
          </Button>
          {canModerate && (
            <>
              <Button variant="secondary" onClick={featureExperiment}><Star className="mr-2 h-4 w-4" />{experiment.featured ? 'Unfeature' : 'Feature'}</Button>
              <Button variant="danger" onClick={archiveExperiment}><Archive className="mr-2 h-4 w-4" />Archive</Button>
            </>
          )}
          {isOwner && (
            <Button variant="danger" onClick={deleteExperiment}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      <section className="mb-6 rounded-2xl border border-border bg-surface/70 p-5 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{experiment.category}</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{experiment.difficulty}</span>
          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{experiment.status}</span>
          {experiment.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{experiment.title}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-text-muted">{experiment.description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-muted">
          <span>By {experiment.authorName || experiment.authorUsername || 'Member'}</span>
          <span>{formatDate(experiment.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{experiment.views || 0} views</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          {[
            ['Overview', experiment.description],
            ['Materials', experiment.materials],
            ['Procedure', experiment.procedure],
            ['Results', experiment.results],
            ['Lessons Learned', experiment.lessonsLearned],
          ].map(([title, value]) => (
            <Card key={title}>
              <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
              <CardContent>{textBlock(value)}</CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader><CardTitle className="text-lg">Media Gallery</CardTitle></CardHeader>
            <CardContent>
              {!experiment.media?.length ? (
                <p className="text-sm text-text-muted">No media uploaded yet.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {experiment.media.map((item, index) => <MediaItem key={`${item.publicId}-${index}`} item={item} />)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-accent" />Comments</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addComment} className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." className="h-11 flex-1 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" />
                <Button type="submit" disabled={!commentText.trim()}>Comment</Button>
              </form>
              <div className="space-y-3">
                {comments.length === 0 ? <p className="text-sm text-text-muted">No comments yet.</p> : comments.map(comment => (
                  <div key={comment.id} className="rounded-xl border border-border bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white">{comment.authorName || 'Member'}</p>
                      {(canModerate || comment.authorId === user?.uid) && (
                        <button
                          type="button"
                          onClick={() => deleteComment(comment.id)}
                          className="rounded-lg p-1 text-text-muted hover:bg-status-danger/10 hover:text-status-danger"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text-soft">{comment.text}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-text-muted">{formatDate(comment.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-accent" />Team Members</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {teamMembers.length === 0 ? <p className="text-sm text-text-muted">No team members listed.</p> : teamMembers.map(member => (
                <Link key={member.id} to={`/profile/${member.id}`} className="block rounded-xl border border-border bg-white/[0.03] p-3 text-sm font-bold text-white hover:border-accent/40">
                  {member.displayName || member.username}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Video className="h-5 w-5 text-accent" />Media Types</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center text-xs text-text-muted">
              <div className="rounded-xl border border-border p-3">{experiment.media?.filter(item => item.type === 'image').length || 0}<br />Images</div>
              <div className="rounded-xl border border-border p-3">{experiment.media?.filter(item => item.type === 'video').length || 0}<br />Videos</div>
              <div className="rounded-xl border border-border p-3">{experiment.media?.filter(item => item.type === 'document').length || 0}<br />Docs</div>
            </CardContent>
          </Card>

          {isOwner && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Pencil className="h-5 w-5 text-accent" />Owner Tools</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full" onClick={() => setEditing(current => !current)}>
                  {editing ? 'Close Editor' : 'Edit Experiment'}
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {editing && editForm && (
        <SectionWrapper title="Edit Experiment" className="mt-6">
          <form onSubmit={saveEdits} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={editForm.title} onChange={(event) => updateEditField('title', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent" required />
              <select value={editForm.category} onChange={(event) => updateEditField('category', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {EXPERIMENT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
              <select value={editForm.difficulty} onChange={(event) => updateEditField('difficulty', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {EXPERIMENT_DIFFICULTIES.map(difficulty => <option key={difficulty}>{difficulty}</option>)}
              </select>
              <select value={editForm.status} onChange={(event) => updateEditField('status', event.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {EXPERIMENT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
            {[
              ['description', 'Overview'],
              ['materials', 'Materials'],
              ['procedure', 'Procedure'],
              ['results', 'Results'],
              ['lessonsLearned', 'Lessons learned'],
            ].map(([field, label]) => (
              <textarea key={field} value={editForm[field]} onChange={(event) => updateEditField(field, event.target.value)} placeholder={label} rows={field === 'description' ? 3 : 4} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            ))}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-muted">Team Members</span>
              <select multiple value={editForm.teamMembers} onChange={(event) => updateEditField('teamMembers', [...event.target.selectedOptions].map(option => option.value))} className="min-h-28 w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                {members.map(member => <option key={member.id} value={member.id}>{member.displayName || member.username}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-border bg-black/20 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-white">Media</p>
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
                  {uploading ? 'Uploading...' : 'Upload Media'}
                  <input type="file" multiple className="hidden" onChange={(event) => uploadEditMedia(event.target.files || [])} disabled={uploading} />
                </label>
              </div>
              {!isCloudinaryConfigured && <p className="mb-3 text-xs text-status-danger">Cloudinary upload preset is not configured.</p>}
              {!editForm.media?.length ? (
                <p className="text-sm text-text-muted">No media attached.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {editForm.media.map((item, index) => (
                    <div key={`${item.publicId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.03] p-2">
                      <span className="min-w-0 truncate text-sm text-text-soft">{item.name}</span>
                      <button type="button" onClick={() => updateEditField('media', editForm.media.filter((_, itemIndex) => itemIndex !== index))} className="text-text-muted hover:text-status-danger" aria-label={`Remove ${item.name}`}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </SectionWrapper>
      )}
    </PageContainer>
  );
}
