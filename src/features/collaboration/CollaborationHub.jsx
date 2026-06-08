import { Link } from 'react-router-dom';
import { Activity, Headphones, Swords, Video, Calendar, MessageSquare } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

const LINKS = [
  { path: '/voice', title: 'Voice Rooms', desc: 'Department, lab, and project voice channels', icon: Headphones },
  { path: '/meet', title: 'Video Meet', desc: 'Camera, screen share, hand raise, AI notes', icon: Video },
  { path: '/meetings', title: 'Meeting Center', desc: 'Schedule, recordings, attendance', icon: Calendar },
  { path: '/activity', title: 'Activity Stream', desc: 'Live ecosystem activity feed', icon: Activity },
  { path: '/chat', title: 'Enhanced Chat', desc: 'Threads, mentions, reactions, search', icon: MessageSquare },
  { path: '/voice', title: 'War Rooms', desc: 'Create focused rooms from organization hub', icon: Swords },
];

export default function CollaborationHub() {
  return (
    <PageContainer>
      <PageHeader
        title="Collaboration OS"
        description="Real-time communication, presence, meetings, and team war rooms across BeastBuck."
      />
      <SectionWrapper>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LINKS.map(({ path, title, desc, icon: Icon }) => (
            <Link key={title} to={path}>
              <Card className="h-full rounded-xl transition hover:border-accent/30">
                <CardContent className="p-5">
                  <Icon className="mb-3 h-8 w-8 text-accent" />
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
