import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import {
  promoteToCoCEO,
  removeCoCEO,
  getExecutives,
  resignAsCEO,
  designateSuccessor,
} from '@services/firestore/executive';
import { UsersService } from '@services/firestore/users';
import {
  Shield,
  Crown,
  UserPlus,
  Trash2,
  Search,
  LogOut,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

// ─── Helper: member picker ────────────────────────────────────────────────────
function MemberPicker({ value, onChange, exclude = [] }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    UsersService.getAllMembers()
      .then((all) => setMembers(all.filter((m) => !exclude.includes(m.id))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.displayName || '').toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username or email..."
          className="pl-10"
        />
      </div>
      <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
        {loading ? (
          <p className="py-8 text-center text-sm text-text-muted">Loading members...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">No members found</p>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => onChange(m)}
              className={`flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-white/10 ${
                value?.id === m.id ? 'border-l-2 border-accent bg-accent/20' : ''
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-500 font-bold text-white">
                {(m.displayName || m.username || 'M')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">
                  {m.displayName || m.username || 'Unknown'}
                </p>
                <p className="truncate text-xs text-text-muted">
                  @{m.username || m.email || 'n/a'}{m.role ? ` · ${m.role}` : ''}
                </p>
              </div>
              {value?.id === m.id && <CheckCircle className="h-4 w-4 shrink-0 text-accent" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Promote Co-CEO modal ─────────────────────────────────────────────────────
function PromoteModal({ currentCeoUid, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    await onConfirm(selected.id, reason);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-1 text-2xl font-bold text-white">Appoint Co-CEO</h2>
      <p className="mb-4 text-sm text-text-muted">
        Select a member to share executive leadership. Only <strong className="text-white">one Co-CEO</strong> is
        allowed at a time.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <MemberPicker value={selected} onChange={setSelected} exclude={[currentCeoUid]} />
        <div>
          <label className="mb-2 block text-sm font-bold text-white">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you promoting this member?"
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
          />
        </div>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" onClick={onClose} variant="secondary" className="w-full">Cancel</Button>
          <Button type="submit" disabled={loading || !selected} className="w-full">
            {loading ? 'Appointing...' : 'Appoint Co-CEO'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Remove Co-CEO modal ──────────────────────────────────────────────────────
function RemoveModal({ target, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(target.id, reason);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-1 text-2xl font-bold text-white">Remove Co-CEO</h2>
      <p className="mb-4 text-sm text-text-muted">
        Remove <span className="font-bold text-white">{target.displayName || target.username}</span> from
        the Co-CEO position? They will revert to Member status.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">Reason (required)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you removing this Co-CEO?"
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
          />
        </div>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" onClick={onClose} variant="secondary" className="w-full">Cancel</Button>
          <Button type="submit" disabled={loading || !reason.trim()} variant="destructive" className="w-full">
            {loading ? 'Removing...' : 'Remove Co-CEO'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Succession modal ─────────────────────────────────────────────────────────
function SuccessionModal({ currentCeoUid, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || !confirmed) return;
    setLoading(true);
    await onConfirm(selected.id, reason);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
          <GitBranch className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Designate Successor</h2>
          <p className="text-xs text-text-muted">Transfer Main CEO role to another member</p>
        </div>
      </div>
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
        <AlertTriangle className="mr-1 inline h-4 w-4" />
        This action is <strong>irreversible</strong>. You will be stepped down to Member immediately.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">Choose Successor</label>
          <MemberPicker value={selected} onChange={setSelected} exclude={[currentCeoUid]} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-white">Reason / Message (required)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="State your reason for succession..."
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 accent-amber-400"
          />
          <span className="text-sm text-text-muted">
            I understand this is permanent and I will lose Main CEO access immediately.
          </span>
        </label>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" onClick={onClose} variant="secondary" className="w-full">Cancel</Button>
          <Button
            type="submit"
            disabled={loading || !selected || !confirmed || !reason.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            {loading ? 'Transferring...' : 'Transfer Leadership'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Resignation modal ────────────────────────────────────────────────────────
function ResignModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
          <LogOut className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Resign as Main CEO</h2>
          <p className="text-xs text-text-muted">Step down without designating a successor</p>
        </div>
      </div>
      <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        <AlertTriangle className="mr-1 inline h-4 w-4" />
        Your role will immediately revert to Member. The platform will have no active CEO until one is
        manually reassigned.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">Resignation Statement (required)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="State your reason for resigning..."
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 accent-red-400"
          />
          <span className="text-sm text-text-muted">
            I understand this is permanent and I will lose all CEO privileges immediately.
          </span>
        </label>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" onClick={onClose} variant="secondary" className="w-full">Cancel</Button>
          <Button
            type="submit"
            disabled={loading || !confirmed || !reason.trim()}
            variant="destructive"
            className="w-full"
          >
            {loading ? 'Resigning...' : 'Confirm Resignation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CommandCenter() {
  const navigate = useNavigate();
  const { user, roleData, refreshUser } = useAuth();
  const isMainCeo = roleData?.role === ROLES.MAIN_CEO;

  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedExec, setSelectedExec] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadExecutives(); }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      setExecutives(await getExecutives());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Guard: Main CEO only
  if (!isMainCeo) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-text-muted">Command Centre is accessible to the Main CEO only.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const coCeoExec = executives.find((e) => e.role === ROLES.CO_CEO);
  const hasCoCeo = Boolean(coCeoExec);

  const handlePromote = async (targetUid, reason) => {
    const result = await promoteToCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      showToast('Member appointed as Co-CEO successfully.');
      await loadExecutives();
      setActiveModal(null);
    } else {
      showToast(result.error || 'Failed to appoint Co-CEO.', 'error');
    }
  };

  const handleRemove = async (targetUid, reason) => {
    const result = await removeCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      showToast('Co-CEO removed successfully.');
      await loadExecutives();
      setActiveModal(null);
    } else {
      showToast(result.error || 'Failed to remove Co-CEO.', 'error');
    }
  };

  const handleSuccession = async (successorUid, reason) => {
    const result = await designateSuccessor(user.uid, successorUid, reason);
    if (result.success) {
      showToast('Leadership transferred. Redirecting...');
      setActiveModal(null);
      if (typeof refreshUser === 'function') await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      showToast(result.error || 'Failed to transfer leadership.', 'error');
    }
  };

  const handleResign = async (reason) => {
    const result = await resignAsCEO(user.uid, reason);
    if (result.success) {
      showToast('You have resigned. Redirecting...');
      setActiveModal(null);
      if (typeof refreshUser === 'function') await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      showToast(result.error || 'Failed to resign.', 'error');
    }
  };

  return (
    <PageContainer className="max-w-4xl">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl ${
            toast.type === 'error'
              ? 'border border-red-400/30 bg-red-500/90 text-white'
              : 'border border-emerald-400/30 bg-emerald-500/90 text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-bold text-white">Command Centre</h1>
        <p className="text-text-muted">Executive leadership management — visible to Main CEO only</p>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Main CEO</p>
                <p className="text-2xl font-bold text-white">1</p>
              </div>
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Co-CEO</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : hasCoCeo ? '1' : '0'} / 1</p>
              </div>
              <Crown className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Co-CEO Section ──────────────────────────────────────────────────── */}
      <Card className="mb-6 border-blue-500/30 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5 text-blue-400" />
            Co-CEO Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCoCeo ? (
            <>
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <div className="min-w-0">
                  <p className="font-bold text-white">
                    {coCeoExec.displayName || coCeoExec.username || 'Co-CEO'}
                  </p>
                  <p className="text-xs text-text-muted">{coCeoExec.email || coCeoExec.uid}</p>
                </div>
                <Button
                  onClick={() => { setSelectedExec(coCeoExec); setActiveModal('remove'); }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
              <p className="text-center text-xs text-text-muted">
                Only one Co-CEO is allowed at a time. Remove the current one to appoint another.
              </p>
            </>
          ) : (
            <Button onClick={() => setActiveModal('promote')} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Appoint Co-CEO
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Succession Section ──────────────────────────────────────────────── */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <GitBranch className="h-5 w-5 text-amber-400" />
            Succession Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            Transfer the Main CEO title to any member. The transfer is atomic and irreversible — you
            will immediately step down to Member status.
          </p>
          <Button
            onClick={() => setActiveModal('succession')}
            className="w-full border border-amber-500/30 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Designate Successor &amp; Transfer Leadership
          </Button>
        </CardContent>
      </Card>

      {/* ── Resignation Section ─────────────────────────────────────────────── */}
      <Card className="border-red-500/30 bg-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <LogOut className="h-5 w-5 text-red-400" />
            CEO Resignation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            Resign from the Main CEO position without designating a successor. Your role reverts to
            Member immediately. No CEO will exist until one is manually assigned.
          </p>
          <Button onClick={() => setActiveModal('resign')} variant="destructive" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Resign as Main CEO
          </Button>
        </CardContent>
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {activeModal === 'promote' && (
        <PromoteModal currentCeoUid={user.uid} onClose={() => setActiveModal(null)} onConfirm={handlePromote} />
      )}
      {activeModal === 'remove' && selectedExec && (
        <RemoveModal target={selectedExec} onClose={() => setActiveModal(null)} onConfirm={handleRemove} />
      )}
      {activeModal === 'succession' && (
        <SuccessionModal currentCeoUid={user.uid} onClose={() => setActiveModal(null)} onConfirm={handleSuccession} />
      )}
      {activeModal === 'resign' && (
        <ResignModal onClose={() => setActiveModal(null)} onConfirm={handleResign} />
      )}
    </PageContainer>
  );
}
