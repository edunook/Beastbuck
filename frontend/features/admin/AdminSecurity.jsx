import { useEffect, useState } from 'react';
import {
  Lock, ShieldAlert, Save, RefreshCw, AlertTriangle,
  UserX, FileX, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { AdminService } from '@services/firestore/admin';
import { useAuth } from '../auth/AuthContext';
import { AdminPanel, AdminToast, StatusBadge } from './adminUtils';

const SECURITY_CONTROLS = [
  {
    field: 'maintenanceMode',
    title: 'Maintenance Mode',
    description: 'Signal that BeastBuck is temporarily under maintenance. Members will see a maintenance notice and cannot log in.',
    icon: Settings,
    impact: 'HIGH',
    color: 'warning',
    warningText: 'This will prevent ALL members from accessing the platform.',
  },
  {
    field: 'registrationLock',
    title: 'Registration Lock',
    description: 'Block all new direct sign-ups. Existing members are unaffected. New users cannot create accounts.',
    icon: UserX,
    impact: 'MEDIUM',
    color: 'accent',
    warningText: 'New users will be unable to register an account.',
  },
  {
    field: 'applicationLock',
    title: 'Application Lock',
    description: 'Pause the public membership application form. Pending applications are preserved but new submissions are blocked.',
    icon: FileX,
    impact: 'LOW',
    color: 'success',
    warningText: 'New membership applications will be paused.',
  },
];

const IMPACT_COLORS = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};

function SecurityToggle({ control, value, onChange }) {
  const { field, title, description, icon: Icon, impact, warningText } = control;
  const isOn = Boolean(value);
  const impactVariant = IMPACT_COLORS[impact];

  const handleToggle = () => {
    if (!isOn) {
      if (!window.confirm(`Enable ${title}?\n\n${warningText}`)) return;
    }
    onChange(field, !isOn);
  };

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 ${
      isOn
        ? 'border-status-danger/30 bg-status-danger/5 shadow-[0_0_20px_rgba(255,42,42,0.05)]'
        : 'border-border bg-white/[0.02] hover:border-white/10'
    }`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isOn ? 'bg-status-danger/20 text-status-danger' : 'bg-white/5 text-text-muted'
          }`}>
            {isOn ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{title}</h3>
              <StatusBadge variant={impactVariant}>{impact} IMPACT</StatusBadge>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              {isOn ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-status-danger shadow-[0_0_6px_rgba(255,42,42,0.8)]" />
                  <span className="text-xs font-bold text-status-danger">ACTIVE</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-text-muted" />
                  <span className="text-xs text-text-muted">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Big Toggle */}
        <button
          onClick={handleToggle}
          className={`relative h-7 w-13 shrink-0 rounded-full border transition-all duration-300 ${
            isOn
              ? 'border-status-danger bg-status-danger/20'
              : 'border-border bg-white/5'
          }`}
          style={{ width: '3.25rem' }}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full transition-all duration-300 ${
              isOn
                ? 'left-[calc(100%-1.75rem)] bg-status-danger shadow-[0_0_10px_rgba(255,42,42,0.6)]'
                : 'left-0.5 bg-white/30'
            }`}
          />
        </button>
      </div>

      <p className="text-sm leading-6 text-text-muted">{description}</p>

      {isOn && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-status-danger/20 bg-status-danger/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
          <p className="text-xs font-bold text-status-danger">{warningText}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminSecurity() {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    maintenanceMode: false,
    registrationLock: false,
    applicationLock: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [original, setOriginal] = useState(null);

  useEffect(() => {
    AdminService.getSecurityConfig()
      .then(c => {
        setConfig(c);
        setOriginal(c);
      })
      .catch(err => console.error('Security config failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => {
      const next = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(next) !== JSON.stringify(original));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await AdminService.updateSecurityConfig(config, user.uid);
      setOriginal(config);
      setHasChanges(false);
      setToast('Security settings saved successfully.');
    } catch (err) {
      setToast('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setConfig(original);
    setHasChanges(false);
  };

  const activeCount = Object.values(config).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onClear={() => setToast('')} />

      {/* Status Banner */}
      {!loading && (
        <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${
          activeCount > 0
            ? 'border-status-danger/30 bg-status-danger/5'
            : 'border-status-success/30 bg-status-success/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              activeCount > 0 ? 'bg-status-danger/20 text-status-danger' : 'bg-status-success/20 text-status-success'
            }`}>
              {activeCount > 0 ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-bold text-white">
                {activeCount > 0 ? `${activeCount} Security Lock${activeCount > 1 ? 's' : ''} Active` : 'All Systems Normal'}
              </p>
              <p className="text-xs text-text-muted">
                {activeCount > 0 ? 'Platform is operating in restricted mode.' : 'No security restrictions are enabled.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.maintenanceMode && <StatusBadge variant="warning">Maintenance</StatusBadge>}
            {config.registrationLock && <StatusBadge variant="accent">Reg Locked</StatusBadge>}
            {config.applicationLock && <StatusBadge variant="default">App Locked</StatusBadge>}
          </div>
        </div>
      )}

      <AdminPanel title="Security Controls" icon={ShieldAlert}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {SECURITY_CONTROLS.map(control => (
              <SecurityToggle
                key={control.field}
                control={control}
                value={config[control.field]}
                onChange={handleChange}
              />
            ))}
          </div>
        )}

        {/* Save / Reset */}
        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
          <div className="text-xs text-text-muted">
            {hasChanges ? (
              <span className="flex items-center gap-1.5 text-status-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-status-warning" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                Settings saved
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={reset}
                className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white"
              >
                Reset
              </button>
            )}
            <button
              onClick={save}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-alt px-6 py-2.5 text-sm font-bold text-background shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </AdminPanel>

      {/* Danger Zone */}
      <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-status-danger" />
          <h3 className="font-bold text-status-danger">Danger Zone</h3>
        </div>
        <p className="text-sm text-text-muted mb-4">
          These settings affect the entire platform and all members. Changes are logged in the audit trail.
          Always verify before enabling any restriction.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
          <span>✓ All changes are logged in Audit Trail</span>
          <span>·</span>
          <span>✓ Admin actor ID is recorded</span>
          <span>·</span>
          <span>✓ Timestamp preserved</span>
        </div>
      </div>
    </div>
  );
}
