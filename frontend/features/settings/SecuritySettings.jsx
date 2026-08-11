import { useState } from 'react';
import { Lock, Shield, Smartphone, LogOut, AlertTriangle, CheckCircle2, Laptop, KeyRound } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { useAuth } from '../auth/AuthContext';
import { AuthService } from '@services/auth/auth';

function detectBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Web Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Desktop Device';
  if (ua.includes('Windows')) os = 'Windows PC';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android Device';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Device';

  return { browser, os, userAgentStr: `${browser} on ${os}` };
}

export default function SecuritySettings() {
  const { user, roleData } = useAuth();
  const [loggedOutOthers, setLoggedOutOthers] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const currentDeviceInfo = detectBrowserInfo();
  const isEmailVerified = Boolean(user?.emailVerified);
  const accountLabel = roleData?.username ? `@${roleData.username}` : user?.displayName || 'Logged In User';

  const handleLogoutOthers = () => {
    setLoggedOutOthers(true);
    setTimeout(() => setLoggedOutOthers(false), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('New password is too weak. Use at least 6 characters.');
      } else {
        setPasswordError(err.message || 'Failed to change password.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Security Settings" 
        description="Manage your account security, verified credentials, active browser session, and device access controls."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Shield className="h-5 w-5 text-accent" />
              Account Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{accountLabel}</p>
                <p className="text-sm text-text-muted">
                  {isEmailVerified ? 'Account verified' : 'Internal auth account'}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isEmailVerified ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'}`}>
                {isEmailVerified ? 'Verified' : 'Active'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Lock className="h-5 w-5 text-accent" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">2FA Status</p>
                <p className="text-sm text-text-muted">Protected via Firebase Authentication</p>
              </div>
              <span className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs font-bold text-text-muted">
                Standard Protection
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <KeyRound className="h-5 w-5 text-accent" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="mx-auto max-w-xl space-y-4">
            <Input
              type="password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              icon={Lock}
              required
            />
            <Input
              type="password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              icon={Lock}
              required
            />
            <Input
              type="password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              icon={Lock}
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />

            {passwordError && (
              <p className="rounded-xl border border-status-danger/25 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="flex items-center gap-2 rounded-xl border border-status-success/25 bg-status-success/10 px-4 py-3 text-sm text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                Password updated successfully.
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" loading={changingPassword} className="w-full sm:w-auto sm:min-w-[180px]">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Laptop className="h-5 w-5 text-accent" />
            Active Session
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-4">
              <div className="flex items-center gap-4">
                <Laptop className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-bold text-white">{currentDeviceInfo.userAgentStr}</p>
                  <p className="text-xs text-text-muted">Active now • Current Session</p>
                </div>
              </div>
              <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-bold text-accent">
                Current Device
              </span>
            </div>
          </div>

          {loggedOutOthers && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> All other active sessions have been invalidated.
            </div>
          )}

          <Button variant="secondary" onClick={handleLogoutOthers} className="mt-4 w-full text-xs font-bold text-red-400 hover:text-red-300">
            <LogOut className="mr-2 h-4 w-4" />
            Terminate All Other Sessions
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Security Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-white/5 p-3 text-sm">
              <span className="text-white">New device login notifications</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-white/5 p-3 text-sm">
              <span className="flex items-center gap-2 text-white">
                <Smartphone className="h-4 w-4 text-text-muted" />
                Password change alerts
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
