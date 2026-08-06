import { useState } from 'react';
import { Mail, Globe, Eye, EyeOff, Shield } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ContactPrivacy() {
  const [email, setEmail] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [emailVisibility, setEmailVisibility] = useState('Public');
  const [portfolioVisibility, setPortfolioVisibility] = useState('Public');

  const sections = [
    { id: 'projects', name: 'Projects', visibility: 'Public' },
    { id: 'research', name: 'Research', visibility: 'Members Only' },
    { id: 'contact', name: 'Contact', visibility: 'Private' },
    { id: 'education', name: 'Education', visibility: 'Public' },
    { id: 'experience', name: 'Experience', visibility: 'Public' },
    { id: 'skills', name: 'Skills', visibility: 'Public' },
  ];

  const visibilityOptions = ['Public', 'Members Only', 'Private'];

  const getVisibilityIcon = (visibility) => {
    return visibility === 'Public' ? Eye : EyeOff;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Contact & Privacy Controls" 
        description="Public email (optional), portfolio link, social links, contact button with visibility options (public, members only, private) and per-section privacy controls."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Public Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Portfolio Link</label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Email Visibility</label>
                <select
                  value={emailVisibility}
                  onChange={(e) => setEmailVisibility(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Portfolio Visibility</label>
                <select
                  value={portfolioVisibility}
                  onChange={(e) => setPortfolioVisibility(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Save Contact Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Section Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = getVisibilityIcon(section.visibility);
                return (
                  <div key={section.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-text-muted" />
                      <span className="font-bold text-white">{section.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-text-muted" />
                      <select
                        defaultValue={section.visibility}
                        className="bg-surface border border-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-accent"
                      >
                        {visibilityOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              Save Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
