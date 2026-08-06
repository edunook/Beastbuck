import { useState } from 'react';
import { Bell, Mail, Smartphone, Volume, Vibrate, Calendar, FileText, ShoppingCart, Bot, Film, AlertTriangle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const preferences = {
    weeklySummary: true,
    marketingMessages: false,
    eventReminders: true,
    researchUpdates: true,
    marketplaceUpdates: true,
    aiUpdates: true,
    funflixUpdates: true,
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notification Preferences" 
        description="Notification preferences including email notifications, browser notifications, in-app notifications, sound, vibration (mobile), weekly summary, marketing messages, event reminders, research updates, marketplace updates, AI updates, and FunFlix updates."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Email Notifications</span>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-12 h-6 rounded-full transition-all ${emailNotifications ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Browser Notifications</span>
                </div>
                <button
                  onClick={() => setBrowserNotifications(!browserNotifications)}
                  className={`w-12 h-6 rounded-full transition-all ${browserNotifications ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${browserNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-text-muted" />
                  <span className="text-white">In-App Notifications</span>
                </div>
                <button
                  onClick={() => setInAppNotifications(!inAppNotifications)}
                  className={`w-12 h-6 rounded-full transition-all ${inAppNotifications ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${inAppNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Volume className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Sound</span>
                </div>
                <button
                  onClick={() => setSound(!sound)}
                  className={`w-12 h-6 rounded-full transition-all ${sound ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${sound ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Vibration (Mobile)</span>
                </div>
                <button
                  onClick={() => setVibration(!vibration)}
                  className={`w-12 h-6 rounded-full transition-all ${vibration ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${vibration ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Weekly Summary</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.weeklySummary ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.weeklySummary ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Marketing Messages</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.marketingMessages ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.marketingMessages ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Event Reminders</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.eventReminders ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.eventReminders ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Research Updates</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.researchUpdates ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.researchUpdates ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Marketplace Updates</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.marketplaceUpdates ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.marketplaceUpdates ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-text-muted" />
                  <span className="text-white">AI Updates</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.aiUpdates ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.aiUpdates ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-text-muted" />
                  <span className="text-white">FunFlix Updates</span>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${preferences.funflixUpdates ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${preferences.funflixUpdates ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Changes
      </Button>
    </PageContainer>
  );
}
