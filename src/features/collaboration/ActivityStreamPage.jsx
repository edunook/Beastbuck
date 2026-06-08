import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, FlaskConical, GraduationCap, Trophy, CheckSquare, Package } from 'lucide-react';
import { CollaborationService } from '../../services/firebase/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

const TYPE_ICONS = {
  PROJECT: Package,
  RESEARCH: FlaskConical,
  TASK: CheckSquare,
  ACHIEVEMENT: Trophy,
  COURSE: GraduationCap,
};

function formatTime(ts) {
  const d = ts?.toDate?.();
  if (!d) return 'Just now';
  return d.toLocaleString();
}

export default function ActivityStreamPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = CollaborationService.subscribeToActivityStream({
      onItems: (list) => {
        setItems(list);
        setLoading(false);
      },
    });
    return () => unsub();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Live Activity Stream"
        description="Realtime feed of projects, research, inventions, tasks, achievements, courses, and events."
        action={<Activity className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        {loading ? (
          <LoadingState text="Listening for activity..." />
        ) : (
          <div className="space-y-2">
            {items.map(item => {
              const Icon = TYPE_ICONS[item.type] || Activity;
              return (
                <Card key={item.id} className="rounded-xl">
                  <CardContent className="flex gap-4 p-4">
                    <Icon className="h-6 w-6 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-accent">{item.category || item.type}</p>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-text-muted">{item.message}</p>
                      <p className="mt-1 text-xs text-text-muted">{formatTime(item.timestamp)}</p>
                      {item.link && (
                        <Link to={item.link} className="mt-2 inline-block text-sm font-bold text-accent hover:underline">
                          View
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {items.length === 0 && (
              <p className="py-12 text-center text-text-muted">Activity will appear here in realtime as members collaborate.</p>
            )}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
