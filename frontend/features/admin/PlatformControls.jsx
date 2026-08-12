import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { Shield, Radio, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function PlatformControls() {
  const { user, roleData } = useAuth();
  const [platformLocked, setPlatformLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState('');

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Platform Controls is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const togglePlatformLock = () => {
    if (platformLocked) {
      setPlatformLocked(false);
      setLockReason('');
    } else {
      const reason = prompt('Enter reason for platform lock:');
      if (reason) {
        setLockReason(reason);
        setPlatformLocked(true);
      }
    }
  };

  const handleCrisisBroadcast = async () => {
    if (!crisisMessage.trim()) return;
    
    try {
      await GovernanceService.createAlert({
        title: 'CRISIS BROADCAST',
        description: crisisMessage,
        severity: 'critical',
        type: 'broadcast',
        createdBy: user?.uid,
      });
      
      setCrisisMessage('');
      setCrisisMode(false);
      alert('Crisis broadcast sent successfully!');
    } catch (error) {
      console.error('Error sending crisis broadcast:', error);
      alert('Failed to send crisis broadcast');
    }
  };

  return (
    <PageContainer className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Controls</h1>
        <p className="text-text-muted">Manage platform-wide settings and emergency communications</p>
      </div>

      {/* Platform Lock Alert */}
      {platformLocked && (
        <Card className="mb-6 border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-bold text-white">Platform Locked</p>
                  <p className="text-sm text-text-muted">{lockReason}</p>
                </div>
              </div>
              <Button
                onClick={togglePlatformLock}
                size="sm"
                variant="destructive"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Lock Control */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Platform Lock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={togglePlatformLock}
            variant={platformLocked ? "destructive" : "secondary"}
            className="w-full"
          >
            {platformLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            {platformLocked ? 'Unlock Platform' : 'Lock Platform'}
          </Button>
        </CardContent>
      </Card>

      {/* Crisis Management */}
      <Card className="border-red-500/30 bg-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Radio className="h-5 w-5 text-red-400" />
            Crisis Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!crisisMode ? (
            <Button
              onClick={() => setCrisisMode(true)}
              variant="destructive"
              className="w-full"
            >
              <Radio className="h-4 w-4 mr-2" />
              Send Crisis Broadcast
            </Button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={crisisMessage}
                onChange={(e) => setCrisisMessage(e.target.value)}
                placeholder="Enter crisis message to broadcast to all members..."
                rows={4}
                className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-red-500/50 focus:outline-none transition-colors resize-none"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCrisisMode(false);
                    setCrisisMessage('');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCrisisBroadcast}
                  disabled={!crisisMessage.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Broadcast
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
