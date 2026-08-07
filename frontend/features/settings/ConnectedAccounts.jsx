import { Link, GitFork, Monitor, Link2, MessageSquare } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ConnectedAccounts() {

  const accounts = [
    { id: 'google', name: 'Google', icon: Link, color: 'red', connected: true, email: 'user@gmail.com' },
    { id: 'github', name: 'GitHub', icon: GitFork, color: 'gray', connected: true, username: 'user' },
    { id: 'microsoft', name: 'Microsoft', icon: Monitor, color: 'blue', connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: Link2, color: 'cyan', connected: false },
    { id: 'discord', name: 'Discord', icon: MessageSquare, color: 'indigo', connected: false },
  ];

  const getColorClass = (color) => {
    const colors = {
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Connected Accounts" 
        description="Connected accounts (future) including Google, GitHub, Microsoft, LinkedIn, and Discord."
        hero={true}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-accent" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon = account.icon;
              return (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getColorClass(account.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{account.name}</h3>
                      {account.connected && (
                        <p className="text-text-muted text-sm">
                          {account.email || account.username}
                        </p>
                      )}
                    </div>
                  </div>
                  {account.connected ? (
                    <Button variant="secondary" className="text-red-400 hover:text-red-300">
                      Disconnect
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      Connect (Coming Soon)
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Security Note</h3>
          </div>
          <p className="text-text-muted">
            Connecting your accounts allows you to sign in faster and share content across platforms. 
            You can disconnect any account at any time from this page.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
