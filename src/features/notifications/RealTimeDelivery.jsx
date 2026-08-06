import { useState } from 'react';
import { Bell, Smartphone, Monitor, Volume2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function RealTimeDelivery() {
  const [toastEnabled, setToastEnabled] = useState(true);
  const [badgeEnabled, setBadgeEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [mobilePushEnabled, setMobilePushEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <PageContainer>
      <PageHeader 
        title="Real-Time Delivery" 
        description="Instant notification delivery using Firebase including Toast Notification, Notification Badge, Desktop Notification (future), and Mobile Push (future)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              In-App Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Toast Notifications</span>
                </div>
                <button
                  onClick={() => setToastEnabled(!toastEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${toastEnabled ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${toastEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Notification Badge</span>
                </div>
                <button
                  onClick={() => setBadgeEnabled(!badgeEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${badgeEnabled ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${badgeEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Sound</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${soundEnabled ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-accent" />
              Desktop Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-text-muted" />
                <span className="text-white">Desktop Notifications</span>
              </div>
              <button
                onClick={() => setDesktopEnabled(!desktopEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${desktopEnabled ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${desktopEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-text-muted text-sm mt-4">
              Desktop notifications will appear even when the browser is minimized.
              <span className="text-amber-400"> Coming Soon</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-accent" />
              Mobile Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-text-muted" />
                <span className="text-white">Mobile Push</span>
              </div>
              <button
                onClick={() => setMobilePushEnabled(!mobilePushEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${mobilePushEnabled ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${mobilePushEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-text-muted text-sm mt-4">
              Receive notifications on your mobile device even when the app is closed.
              <span className="text-amber-400"> Coming Soon</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Firebase Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-text-muted mb-4">
              Real-time notifications are powered by Firebase Cloud Messaging (FCM) for instant delivery.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-lg">✓</span>
                <span className="text-white">Real-time delivery</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-lg">✓</span>
                <span className="text-white">Cross-platform support</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-lg">✓</span>
                <span className="text-white">Reliable delivery</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-lg">✓</span>
                <span className="text-white">Low latency</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Preferences
      </Button>
    </PageContainer>
  );
}
