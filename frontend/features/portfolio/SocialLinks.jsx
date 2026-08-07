import { Globe, Link, GitFork, Play, MessageSquare, Image, Layout, FileText, BookOpen, GraduationCap, PenTool } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function SocialLinks() {
  const socialLinks = [
    { id: 'website', name: 'Website', icon: Globe, color: 'purple', placeholder: 'https://yourwebsite.com' },
    { id: 'linkedin', name: 'LinkedIn', icon: Link, color: 'cyan', placeholder: 'https://linkedin.com/in/username' },
    { id: 'github', name: 'GitHub', icon: GitFork, color: 'emerald', placeholder: 'https://github.com/username' },
    { id: 'youtube', name: 'YouTube', icon: Play, color: 'red', placeholder: 'https://youtube.com/@username' },
    { id: 'twitter', name: 'Twitter', icon: MessageSquare, color: 'blue', placeholder: 'https://twitter.com/username' },
    { id: 'instagram', name: 'Instagram', icon: Image, color: 'pink', placeholder: 'https://instagram.com/username' },
    { id: 'portfolio', name: 'Portfolio Website', icon: Layout, color: 'violet', placeholder: 'https://portfolio.com' },
    { id: 'researchgate', name: 'ResearchGate', icon: FileText, color: 'amber', placeholder: 'https://researchgate.net/profile/username' },
    { id: 'orcid', name: 'ORCID', icon: BookOpen, color: 'orange', placeholder: 'https://orcid.org/0000-0000-0000-0000' },
    { id: 'scholar', name: 'Google Scholar', icon: GraduationCap, color: 'teal', placeholder: 'https://scholar.google.com/citations?user=ID' },
    { id: 'blog', name: 'Personal Blog', icon: PenTool, color: 'rose', placeholder: 'https://blog.yourname.com' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      orange: 'bg-orange-500/20 border-orange-500/30 border-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Social Links" 
        description="Social link support for website, LinkedIn, GitHub, YouTube, Twitter, Instagram, portfolio website, ResearchGate, ORCID, Google Scholar, and personal blog."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(link.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-3">{link.name}</h3>
                <input
                  type="url"
                  placeholder={link.placeholder}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-accent mb-3"
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                  Save Link
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
