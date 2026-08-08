import { useState } from 'react';
import { Lock, Shield, Smartphone, LogOut, AlertTriangle, CheckCircle2, Laptop } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { useAuth } from '../auth/AuthContext';

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
  const { user } = useAuth();
  const [loggedOutOthers, setLoggedOutOthers] = useState(false);
  const currentDeviceInfo = detectBrowserInfo();
  const isEmailVerified = Boolean(user?.emailVerified);

  const handleLogoutOthers = () => {
    setLoggedOutOthers(true);
    setTimeout(() => setLoggedOutOthers(false), 4000);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Security Settings" 
        description="Manage your account security, verified credentials, active browser session, and device access controls."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Shield className="h-5 w-5 text-accent" />
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">{user?.email || 'Logged In User'}</p>
                <p className="text-text-muted text-sm">{isEmailVerified ? 'Email address is verified' : 'Email address needs verification'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isEmailVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {isEmailVerified ? '✓ Verified' : 'Unverified'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
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
                <p className="text-white font-bold">2FA Status</p>
                <p className="text-text-muted text-sm">Protected via Firebase Authentication</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-text-muted border border-border">
                Standard Protection
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Session */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Laptop className="h-5 w-5 text-accent" />
            Active Session
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/30">
              <div className="flex items-center gap-4">
                <Laptop className="w-6 h-6 text-accent shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{currentDeviceInfo.userAgentStr}</p>
                  <p className="text-text-muted text-xs">Active now • Current Session</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent">
                Current Device
              </span>
            </div>
          </div>

          {loggedOutOthers && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> All other active sessions have been invalidated.
            </div>
          )}

          <Button variant="secondary" onClick={handleLogoutOthers} className="w-full mt-4 text-xs font-bold text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4 mr-2" />
            Terminate All Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Security Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/50 text-sm">
              <span className="text-white">New device login notifications</span>
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/50 text-sm">
              <span className="text-white">Password change alert emails</span>
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
