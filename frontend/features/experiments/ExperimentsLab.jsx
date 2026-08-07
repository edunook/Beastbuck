import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Eye, FlaskConical, Heart, Plus, Search, Star, Upload, X, BookOpen, Lightbulb, Rocket } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { hasPermission } from '@shared/permissions/permissions';
import {
  EXPERIMENT_CATEGORIES,
  EXPERIMENT_DIFFICULTIES,
  EXPERIMENT_STATUSES,
  ExperimentsService,
} from '@services/firestore/experiments';
import { UsersService } from '@services/firestore/users';
import { isCloudinaryConfigured, uploadExperimentMedia } from '@services/storage/cloudinary';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Invention',
  difficulty: 'Beginner',
  status: 'PLANNING',
  teamMembers: [],
  media: [],
  materials: '',
  procedure: '',
  results: '',
  lessonsLearned: '',
};

const BEGINNER_TEMPLATES = [
  {
    id: 'simple-circuit',
    title: 'Simple LED Circuit',
    category: 'Invention',
    difficulty: 'Beginner',
    description: 'Build a basic LED circuit to learn about electricity and components.',
    materials: 'LED bulb, resistor, battery holder, batteries, breadboard, jumper wires',
    procedure: '1. Connect the resistor to the LED anode\n2. Connect the cathode to the negative terminal\n3. Connect the resistor to the positive terminal\n4. Insert batteries and test',
    results: 'LED lights up when circuit is complete',
    lessonsLearned: 'Understanding of basic circuit principles and polarity',
  },
  {
    id: 'plant-growth',
    title: 'Plant Growth Experiment',
    category: 'Research',
    difficulty: 'Beginner',
    description: 'Compare plant growth under different light conditions.',
    materials: '2 identical plants, grow light, natural light spot, ruler, notebook',
    procedure: '1. Place one plant under grow light\n2. Place one in natural light\n3. Water both equally\n4. Measure height daily for 2 weeks',
    results: 'Record growth rates and compare',
    lessonsLearned: 'Effects of light intensity on plant development',
  },
  {
    id: 'water-filtration',
    title: 'DIY Water Filter',
    category: 'Invention',
    difficulty: 'Beginner',
    description: 'Create a simple water filtration system using household materials.',
    materials: 'Plastic bottle, sand, gravel, activated charcoal, cotton cloth, dirty water',
    procedure: '1. Cut bottle in half\n2. Layer materials: cotton, charcoal, sand, gravel\n3. Pour dirty water through\n4. Collect filtered water',
    results: 'Water clarity improvement',
    lessonsLearned: 'Basic filtration principles and water purification',
  },
];

const GUIDE_STEPS = [
  {
    icon: Lightbulb,
    title: 'Choose Your Topic',
    description: 'Pick something you\'re curious about. Start simple and build confidence.',
  },
  {
    icon: BookOpen,
    title: 'Research & Plan',
    description: 'Learn about similar experiments. List materials you\'ll need.',
  },
  {
    icon: Rocket,
    title: 'Run Your Experiment',
    description: 'Follow your procedure carefully. Document everything.',
  },
  {
    icon: FlaskConical,
    title: 'Analyze Results',
    description: 'What happened? What did you learn? Share your findings.',
  },
];

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'New';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function getLikeCount(experiment) {
  return Array.isArray(experiment.likes) ? experiment.likes.length : Number(experiment.likes || 0);
}

function ExperimentForm({ initialValue = EMPTY_FORM, members, onCancel, onSubmit, submitting, onUseTemplate }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValue });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const uploadFiles = async (files) => {
    setUploadError('');
    if (!files.length) return;
    if (!isCloudinaryConfigured) {
      setUploadError('Cloudinary upload preset is not configured.');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all([...files].map(file => uploadExperimentMedia(file)));
      updateField('media', [...form.media, ...uploaded]);
    } catch (err) {
      console.error('Experiment media upload failed:', err);
      setUploadError('Media upload failed. Try a smaller file or check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{initialValue.id ? 'Edit Experiment' : 'Create Experiment'}</h2>
        <button type="button" onClick={onCancel} className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-white" aria-label="Close form">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!initialValue.id && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <p className="mb-2 text-xs font-bold text-accent">💡 New to experiments? Start with a template!</p>
          <div className="flex flex-wrap gap-2">
            {BEGINNER_TEMPLATES.slice(0, 2).map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => onUseTemplate?.(template)}
                className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-text-soft hover:border-accent/40 hover:text-white transition"
              >
                {template.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Title <span className="text-status-danger">*</span></label>
          <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Experiment title" required maxLength={100} />
          <div className="mt-1 text-[10px] text-text-muted text-right">{form.title.length}/100</div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
          <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {EXPERIMENT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Difficulty</label>
          <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {EXPERIMENT_DIFFICULTIES.map(difficulty => <option key={difficulty}>{difficulty}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Status</label>
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
            {EXPERIMENT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Description <span className="text-status-danger">*</span></label>
        <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Short overview of your experiment" required rows={3} maxLength={500} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <div className="mt-1 text-[10px] text-text-muted text-right">{form.description.length}/500</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['materials', 'Materials', 'List materials and equipment needed'],
          ['procedure', 'Procedure', 'Step-by-step instructions'],
          ['results', 'Results', 'Document your findings'],
          ['lessonsLearned', 'Lessons learned', 'What did you learn?'],
        ].map(([field, label, placeholder]) => (
          <div key={field}>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
            <textarea value={form[field]} onChange={(event) => updateField(field, event.target.value)} placeholder={placeholder} rows={4} maxLength={2000} className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            <div className="mt-1 text-[10px] text-text-muted text-right">{form[field].length}/2000</div>
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted">Team Members</label>
        <p className="mb-2 text-[10px] text-text-muted">Hold Ctrl/Cmd to select multiple members</p>
        <select multiple value={form.teamMembers} onChange={(event) => updateField('teamMembers', [...event.target.selectedOptions].map(option => option.value))} className="min-h-28 w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
          {members.map(member => <option key={member.id} value={member.id}>{member.displayName || member.username}</option>)}
        </select>
        {form.teamMembers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {form.teamMembers.map(uid => {
              const member = members.find(m => m.id === uid);
              return member ? (
                <span key={uid} className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
                  {member.displayName || member.username}
                  <button type="button" onClick={() => updateField('teamMembers', form.teamMembers.filter(id => id !== uid))} className="hover:text-status-danger">×</button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-black/20 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Media Gallery</p>
            <p className="text-xs text-text-muted">Images, videos, and documents stored as Cloudinary media objects.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold text-text-soft hover:text-white">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files || [])} disabled={uploading} />
          </label>
        </div>
        {uploadError && <p className="mb-3 text-sm text-status-danger">{uploadError}</p>}
        {form.media.length === 0 ? (
          <p className="text-sm text-text-muted">No media attached yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {form.media.map((item, index) => (
              <div key={`${item.publicId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.03] p-2">
                <span className="min-w-0 truncate text-sm text-text-soft">{item.name}</span>
                <button type="button" onClick={() => updateField('media', form.media.filter((_, itemIndex) => itemIndex !== index))} className="text-text-muted hover:text-status-danger" aria-label={`Remove ${item.name}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting || uploading}>{submitting ? 'Saving...' : 'Save Experiment'}</Button>
      </div>
    </form>
  );
}

function ExperimentCard({ experiment, canModerate, onArchive, onFeature }) {
  const firstImage = experiment.media?.find(item => item.type === 'image');

  return (
    <Card className="rounded-lg">
      {firstImage && <img src={firstImage.url} alt={experiment.title} className="h-36 sm:h-44 w-full object-cover" />}
      <CardContent className="p-3 sm:p-5">
        <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          <span className="rounded-lg bg-accent/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-accent">{experiment.category}</span>
          <span className="rounded-lg bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-text-muted">{experiment.status}</span>
          {experiment.featured && <span className="rounded-lg bg-status-warning/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-status-warning">Featured</span>}
        </div>
        <Link to={`/workspace/experiments/${experiment.id}`} className="block">
          <h3 className="line-clamp-2 text-sm sm:text-lg font-bold text-white hover:text-accent">{experiment.title}</h3>
        </Link>
        <p className="mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-5 sm:leading-6 text-text-muted">{experiment.description}</p>
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs text-text-muted">
          <span className="truncate">{experiment.authorName || experiment.authorUsername || 'Member'} · {formatDate(experiment.createdAt)}</span>
          <span className="inline-flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{getLikeCount(experiment)}</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{experiment.views || 0}</span>
          </span>
        </div>
        {canModerate && (
          <div className="mt-3 sm:mt-4 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => onFeature(experiment)} className="flex-1 text-[10px] sm:text-xs">
              <Star className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> {experiment.featured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => onArchive(experiment.id)} className="flex-1 text-[10px] sm:text-xs">
              <Archive className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Archive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExperimentsLab() {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState([]);
  const [members, setMembers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', creatorId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [templateData, setTemplateData] = useState(null);
  const canModerate = hasPermission(roleData?.role, 'canDeleteContent');
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  const isCEO = roleData?.role === 'Main CEO' || roleData?.role === 'Co-CEO';
  const canCreateExperiment = isApprovedMember || isCEO;

  const author = useMemo(() => ({
    uid: user?.uid,
    name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
    username: roleData?.username || user?.displayName || '',
  }), [roleData?.displayName, roleData?.username, user?.displayName, user?.uid]);

  const updateFilters = (patch) => {
    setLoading(true);
    setFilters(current => ({ ...current, ...patch }));
  };

  const loadExperiments = async () => {
    setError('');
    try {
      const [nextExperiments, nextCreators] = await Promise.all([
        ExperimentsService.searchExperiments(filters),
        ExperimentsService.getCreators(),
      ]);
      setExperiments(nextExperiments);
      setCreators(nextCreators);
    } catch (err) {
      console.error('Experiments load failed:', err);
      setError('Could not load experiments. Check Firestore permissions and indexes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadExperiments();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.creatorId, filters.status]);

  useEffect(() => {
    UsersService.getAssignableMembers().then(setMembers).catch((err) => {
      console.error('Experiment member load failed:', err);
    });
  }, []);

  const submitExperiment = async (form) => {
    if (!canCreateExperiment) {
      setError('You need an approved membership or CEO role to create experiments.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const experimentId = await ExperimentsService.createExperiment(form, author);
      setShowForm(false);
      navigate(`/workspace/experiments/${experimentId}`);
    } catch (err) {
      console.error('Experiment create failed:', err);
      setError('Experiment could not be created. Check Cloudinary and Firestore rules.');
    } finally {
      setSubmitting(false);
    }
  };

  const useTemplate = (template) => {
    setTemplateData({
      ...EMPTY_FORM,
      title: template.title,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      materials: template.materials,
      procedure: template.procedure,
      results: template.results,
      lessonsLearned: template.lessonsLearned,
    });
  };

  const archiveExperiment = async (experimentId) => {
    await ExperimentsService.archiveExperiment(experimentId);
    loadExperiments();
  };

  const featureExperiment = async (experiment) => {
    await ExperimentsService.featureExperiment(experiment.id, !experiment.featured);
    loadExperiments();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Experiments Lab"
        description="Create, search, share, and review BeastBuck experiments and inventions."
        action={
          canCreateExperiment ? (
            <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> New Experiment</Button>
          ) : (
            <Button variant="secondary" disabled><Plus className="mr-2 h-4 w-4" /> New Experiment (Requires Approved Membership)</Button>
          )
        }
      />

      {error && <div className="mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">{error}</div>}

      <SectionWrapper>
        <Card className="rounded-xl border border-accent/20 bg-accent/5">
          <CardContent className="p-4 md:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <BookOpen className="h-5 w-5 text-accent" />
              Beginner's Guide to Experiments
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GUIDE_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-text-muted">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </SectionWrapper>

      {showForm && (
        <SectionWrapper>
          <ExperimentForm initialValue={templateData || EMPTY_FORM} members={members} onCancel={() => { setShowForm(false); setTemplateData(null); }} onSubmit={submitExperiment} submitting={submitting} onUseTemplate={useTemplate} />
        </SectionWrapper>
      )}

      <SectionWrapper>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:gap-3 pt-0 sm:grid-cols-2 md:grid-cols-4">
            <Input value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Search experiments..." />
            <select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All categories</option>
              {EXPERIMENT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
            </select>
            <select value={filters.creatorId} onChange={(event) => updateFilters({ creatorId: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All creators</option>
              {creators.map(creator => <option key={creator.id} value={creator.id}>{creator.name}</option>)}
            </select>
            <select value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
              <option value="">All statuses</option>
              {EXPERIMENT_STATUSES.filter(status => status !== 'ARCHIVED').map(status => <option key={status}>{status}</option>)}
            </select>
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper>
        {loading ? (
          <div className="flex min-h-52 sm:min-h-64 items-center justify-center"><LoadingState text="Loading experiments..." /></div>
        ) : experiments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 sm:p-8 text-center">
            <FlaskConical className="mx-auto mb-3 h-8 w-8 sm:h-10 sm:w-10 text-text-muted" />
            <h2 className="mb-1 text-base sm:text-lg font-bold text-white">No experiments found</h2>
            <p className="text-xs sm:text-sm text-text-muted">Create the first lab record or loosen your filters.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {experiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} canModerate={canModerate} onArchive={archiveExperiment} onFeature={featureExperiment} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
