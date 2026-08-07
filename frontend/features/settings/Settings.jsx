import { useState } from 'react';
import { User, Shield, Palette, Bell, Lock, Mail, Save, Eye, EyeOff, Moon, Sun, Monitor } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const [profileData, setProfileData] = useState({
    displayName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Passionate developer and community builder',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
  });

  const [accountData, setAccountData] = useState({
    email: 'john@example.com',
    emailUpdates: true,
    marketingEmails: false,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [themeData, setThemeData] = useState({
    theme: 'dark',
    accentColor: 'blue',
    glassEffect: true,
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mentions: true,
    messages: true,
    systemUpdates: true,
    weeklyDigest: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences, security, and notifications."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-accent text-white' 
                        : 'text-text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Display Name</label>
                  <Input
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Username</label>
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    placeholder="Your username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="your@email.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Website</label>
                  <Input
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Email Address</label>
                  <Input
                    value={accountData.email}
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                    placeholder="your@email.com"
                    type="email"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Email Updates</p>
                    <p className="text-sm text-text-muted">Receive important account updates</p>
                  </div>
                  <button
                    onClick={() => setAccountData({...accountData, emailUpdates: !accountData.emailUpdates})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      accountData.emailUpdates ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      accountData.emailUpdates ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Marketing Emails</p>
                    <p className="text-sm text-text-muted">Receive promotional content</p>
                  </div>
                  <button
                    onClick={() => setAccountData({...accountData, marketingEmails: !accountData.marketingEmails})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      accountData.marketingEmails ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      accountData.marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Current Password</label>
                  <div className="relative">
                    <Input
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">New Password</label>
                  <Input
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Confirm Password</label>
                  <Input
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    type="password"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-text-muted">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() => setSecurityData({...securityData, twoFactorEnabled: !securityData.twoFactorEnabled})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      securityData.twoFactorEnabled ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Update Security'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'theme' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-accent" />
                  Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', icon: Moon, label: 'Dark' },
                      { id: 'light', icon: Sun, label: 'Light' },
                      { id: 'system', icon: Monitor, label: 'System' },
                    ].map(theme => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setThemeData({...themeData, theme: theme.id})}
                          className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2 ${
                            themeData.theme === theme.id 
                              ? 'border-accent bg-accent/20' 
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Accent Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {['blue', 'purple', 'green', 'orange', 'red'].map(color => (
                      <button
                        key={color}
                        onClick={() => setThemeData({...themeData, accentColor: color})}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          themeData.accentColor === color 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : '#ef4444' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Glass Effect</p>
                    <p className="text-sm text-text-muted">Enable glassmorphism effects</p>
                  </div>
                  <button
                    onClick={() => setThemeData({...themeData, glassEffect: !themeData.glassEffect})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      themeData.glassEffect ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      themeData.glassEffect ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Apply Theme'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-text-muted">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, emailNotifications: !notificationData.emailNotifications})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.emailNotifications ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-white">Push Notifications</p>
                      <p className="text-sm text-text-muted">Receive browser push notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, pushNotifications: !notificationData.pushNotifications})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.pushNotifications ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Mentions</p>
                    <p className="text-sm text-text-muted">When someone mentions you</p>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, mentions: !notificationData.mentions})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.mentions ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.mentions ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Messages</p>
                    <p className="text-sm text-text-muted">When you receive new messages</p>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, messages: !notificationData.messages})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.messages ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.messages ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">System Updates</p>
                    <p className="text-sm text-text-muted">Platform updates and announcements</p>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, systemUpdates: !notificationData.systemUpdates})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.systemUpdates ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.systemUpdates ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Weekly Digest</p>
                    <p className="text-sm text-text-muted">Weekly summary of activity</p>
                  </div>
                  <button
                    onClick={() => setNotificationData({...notificationData, weeklyDigest: !notificationData.weeklyDigest})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationData.weeklyDigest ? 'bg-accent' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationData.weeklyDigest ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
