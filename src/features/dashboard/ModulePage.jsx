import { useState, useEffect } from 'react';
import {
  Bot,
  Brain,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Megaphone,
  MessageSquareText,
  Package,
  Palette,
  Settings,
  Sparkles,
  Trophy,
  User,
  UsersRound,
  Loader2,
} from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import EmptyState from '../../components/ui/EmptyState';

const MODULE_CONFIGS = {
  chat: { title: 'Team Chat', description: 'Channel-based collaboration for announcements, experiments, products, coding, ideas, and team updates.', icon: MessageSquareText, collection: 'chat_channels' },
  experiments: { title: 'Experiments Lab', description: 'A structured hub for science tests, inventions, discoveries, research notes, and team evidence.', icon: FlaskConical, collection: 'experiments' },
  products: { title: 'Products Marketplace', description: 'Showcase member-built products, prototypes, designs, and sale-ready ideas with CEO moderation.', icon: Package, collection: 'products' },
  creative: { title: 'Creative Hub', description: 'A gallery for drawings, crafts, models, posters, design concepts, and visual invention work.', icon: Palette, collection: 'creative_works' },
  skills: { title: 'Skill Ecosystems', description: 'Learning tracks that connect posts, challenges, projects, and discussions to real BeastBuck work.', icon: Brain, collection: 'skills' },
  teams: { title: 'Teams System', description: 'Dedicated spaces for robotics, science, product, and design teams to coordinate projects.', icon: UsersRound, collection: 'teams' },
  announcements: { title: 'Announcements Center', description: 'A leadership publishing area for updates, challenges, winners, reminders, and company news.', icon: Megaphone, collection: 'organizationAnnouncements' },
  leaderboards: { title: 'Leaderboards', description: 'Friendly rankings for XP, experiments, products, challenges, and team contributions.', icon: Trophy, collection: 'users' },
  notifications: { title: 'Notification Center', description: 'A focused inbox for tasks, mentions, approvals, achievements, announcements, and team updates.', icon: Bell, collection: 'users' },
  analytics: { title: 'Analytics Center', description: 'Operational metrics for member activity, completed tasks, experiments, products, XP, and growth.', icon: BarChart3, collection: 'users' },
  assessment: { title: 'Role Assessment Center', description: 'Strength tests that recommend Scientist, Engineer, Leader, Developer, Inventor, Artist, Researcher, and Marketer badges.', icon: ClipboardCheck, collection: 'users' },
  ai: { title: 'BeastBuck AI Assistant', description: 'A future project helper for science explanations, coding support, reports, and invention brainstorming.', icon: Bot, collection: 'aiChatSessions' },
  profile: { title: 'Member Profile', description: 'A portfolio-style identity page for roles, XP, levels, achievements, skills, products, and experiments.', icon: User, collection: 'users' },
  settings: { title: 'Settings', description: 'Member controls for profile customization, notifications, privacy, and workspace preferences.', icon: Settings, collection: 'users' },
};

function StatCard({ value, label }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-5">
        <div className="font-heading text-2xl font-black text-white">{value}</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">{label}</div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ item }) {
  return (
    <article className="rounded-lg border border-border bg-white/[0.04] p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-white">{item.title}</h3>
        <span className="w-fit rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-accent">
          {item.meta}
        </span>
      </div>
      <p className="text-sm leading-6 text-text-muted">{item.detail}</p>
    </article>
  );
}

export default function ModulePage({ type }) {
  const config = MODULE_CONFIGS[type] ?? MODULE_CONFIGS.skills;
  const Icon = config.icon;
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        
        if (config.collection) {
          const dataQuery = query(
            collection(db, config.collection),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const dataSnap = await getDocs(dataQuery);
          
          const items = dataSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Calculate stats from real data
          const stats = [
            [items.length.toString(), 'total items'],
            [items.filter(i => i.status === 'active').length.toString(), 'active'],
            [items.filter(i => i.createdAt).length.toString(), 'recent'],
          ];

          setModuleData({
            stats,
            primary: items.slice(0, 3).map(item => ({
              title: item.title || item.name || 'Untitled',
              meta: item.category || item.type || 'General',
              detail: item.description || item.summary || 'No description available.',
            })),
            secondaryTitle: `${config.title} Features`,
            secondary: [
              'Real-time data synchronization',
              'Advanced filtering and search',
              'Collaborative editing support',
              'Analytics and reporting',
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch module data:', error);
        setModuleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [type, config]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  if (!moduleData) {
    return (
      <PageContainer>
        <PageHeader
          title={config.title}
          description={config.description}
          action={
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <Icon className="h-6 w-6" />
            </div>
          }
        />
        <EmptyState
          icon={Icon}
          title="No Data Available"
          description="This module is ready for data. Start creating content to see it here."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <Icon className="h-6 w-6" />
          </div>
        }
      />

      <SectionWrapper>
        <div className="grid gap-4 sm:grid-cols-3">
          {moduleData.stats.map(([value, label]) => (
            <StatCard key={label} value={value} label={label} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            {moduleData.primary.length > 0 ? (
              moduleData.primary.map((item) => (
                <FeatureRow key={item.title} item={item} />
              ))
            ) : (
              <EmptyState
                icon={Icon}
                title="No Items Yet"
                description="No items found in this module."
                variant="default"
              />
            )}
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent" />
                {moduleData.secondaryTitle}
              </CardTitle>
              <CardDescription>Features available in this module.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {moduleData.secondary.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-black/20 p-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-status-success" />
                  <span className="text-sm font-semibold text-text-soft">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
