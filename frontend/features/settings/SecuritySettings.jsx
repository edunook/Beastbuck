import { Lock, Shield, Smartphone, LogOut, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function SecuritySettings() {

  const securityData = {
    emailVerified: true,
    activeSessions: [
      { id: 1, device: 'Chrome on Windows', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
      { id: 2, device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
    ],
    activeDevices: [
      { id: 1, name: 'Windows PC', lastUsed: '2 minutes ago', current: true },
      { id: 2, name: 'iPhone 14', lastUsed: '1 hour ago', current: false },
    ],
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Security Settings" 
        description="Security controls including change password, email verification status, recent login sessions, active devices, logout other devices, two-factor authentication (future), and security alerts."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">Email Status</p>
                <p className="text-text-muted text-sm">{securityData.emailVerified ? 'Verified' : 'Not Verified'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${securityData.emailVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {securityData.emailVerified ? '✓ Verified' : 'Verify Now'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">2FA Status</p>
                <p className="text-text-muted text-sm">Coming Soon</p>
              </div>
              <Button variant="secondary" disabled>
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-accent" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {securityData.activeSessions.map((session) => (
              <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl ${session.current ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💻</div>
                  <div>
                    <p className="text-white font-bold">{session.device}</p>
                    <p className="text-text-muted text-sm">{session.location}</p>
                    <p className="text-text-muted text-xs">{session.lastActive}</p>
                  </div>
                </div>
                {session.current && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full mt-4 text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4 mr-2" />
            Logout Other Devices
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-accent" />
            Active Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {securityData.activeDevices.map((device) => (
              <div key={device.id} className={`flex items-center justify-between p-4 rounded-xl ${device.current ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📱</div>
                  <div>
                    <p className="text-white font-bold">{device.name}</p>
                    <p className="text-text-muted text-sm">{device.lastUsed}</p>
                  </div>
                </div>
                {device.current && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">New login from unknown device</span>
              <span className="text-emerald-400 text-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Password change notification</span>
              <span className="text-emerald-400 text-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Email change notification</span>
              <span className="text-emerald-400 text-sm">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
