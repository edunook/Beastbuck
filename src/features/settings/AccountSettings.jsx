import { useAuth } from '../auth/AuthContext';
import { Mail, Lock, Calendar, Shield, Download, Trash2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AccountSettings() {
  const { user } = useAuth();

  const accountData = {
    email: user?.email || 'user@example.com',
    accountStatus: 'Active',
    membershipStatus: 'Senior Member',
    accountCreationDate: '2022-01-15',
    connectedProviders: ['Google', 'GitHub'],
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Account Settings" 
        description="Account management including email, password, connected login providers, account status, membership status, account creation date, export account (future), and delete account (future)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={accountData.email}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <Button variant="secondary">
                Change Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Connected Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {accountData.connectedProviders.map((provider) => (
                <div key={provider} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-white">{provider}</span>
                  <span className="text-emerald-400 text-sm">Connected</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4">
              Add Provider
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Account Status</span>
                <span className="text-emerald-400 font-bold">{accountData.accountStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Membership Status</span>
                <span className="text-accent font-bold">{accountData.membershipStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Account Created</span>
                <span className="text-white">{accountData.accountCreationDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Export Account</h3>
                <p className="text-text-muted text-sm">Download your data (Coming Soon)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Delete Account</h3>
                <p className="text-text-muted text-sm">Permanently delete (Coming Soon)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
