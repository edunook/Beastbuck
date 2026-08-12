import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { promoteToCoCEO, removeCoCEO, getExecutives } from '@services/firestore/executive';
import { Shield, Crown, UserPlus, Trash2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function CommandCenter() {
  const { user, roleData } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      const execs = await getExecutives();
      setExecutives(execs);
    } catch (error) {
      console.error('Error loading executives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await promoteToCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to promote user');
    }
  };

  const handleRemoveCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await removeCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to remove Co-CEO');
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Command Center is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const mainCeoCount = executives.filter(e => e.role === ROLES.MAIN_CEO || e.role === 'CEO').length || (roleData?.role === ROLES.MAIN_CEO ? 1 : 0);
  const coCeoExecutives = executives.filter(e => e.role === ROLES.CO_CEO || e.role === 'Co-CEO');

  return (
    <PageContainer className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Executive Management</h1>
        <p className="text-text-muted">Manage CEO and Co-CEO roles for platform leadership</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 mb-6 grid-cols-2">
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">CEO</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : mainCeoCount}</p>
              </div>
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Co-CEOs</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : coCeoExecutives.length}</p>
              </div>
              <Crown className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Management */}
      <Card className="border-purple-500/30 bg-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5 text-purple-400" />
            Executive Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coCeoExecutives.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-text-muted">Current Co-CEOs</p>
                {coCeoExecutives.map(executive => (
                  <div key={executive.id || executive.uid || executive.email} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="min-w-0">
                      <p className="font-bold text-white">{executive.displayName || executive.username || executive.email || 'Co-CEO'}</p>
                      <p className="text-xs text-text-muted">{executive.email || executive.id || executive.uid}</p>
                    </div>
                    {roleData?.role === ROLES.MAIN_CEO && (
                      <Button
                        onClick={() => {
                          setSelectedUser(executive);
                          setActionModal('remove');
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => setActionModal('promote')}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Promote to Co-CEO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Modal */}
      {actionModal === 'promote' && (
        <PromoteModal
          onClose={() => setActionModal(null)}
          onConfirm={handlePromoteCoCEO}
        />
      )}

      {actionModal === 'remove' && selectedUser && (
        <RemoveModal
          user={selectedUser}
          onClose={() => setActionModal(null)}
          onConfirm={handleRemoveCoCEO}
        />
      )}
    </PageContainer>
  );
}

function PromoteModal({ onClose, onConfirm }) {
  const [targetUid, setTargetUid] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUid.trim()) return;
    setLoading(true);
    await onConfirm(targetUid.trim(), reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Promote to Co-CEO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">User ID</label>
            <Input
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="Enter user UID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you promoting this user?"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Promoting...' : 'Promote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RemoveModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(user.id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Remove Co-CEO</h2>
        <p className="text-text-muted mb-6">
          Are you sure you want to remove {user.displayName || user.username} from Co-CEO role?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you removing this Co-CEO?"
              rows={3}
              required
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
