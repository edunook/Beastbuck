import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader, EmptyState } from '../../components/ui/UIElements';
import { Calendar, Users, MapPin, Video, Sparkles } from 'lucide-react';

export default function GlobalEventsHub() {
  const [events] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load events from Firebase
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Global Events Hub" description="Participate in worldwide conferences, hackathons, and research symposiums." />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Events Yet"
          description="Global events will be announced here. Check back for upcoming conferences, hackathons, and research symposiums."
        />
      ) : (
        <div className="space-y-4">
          {events.map((evt, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-accent" />
                  <h3 className="font-bold text-white">{evt.name}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{evt.type}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {evt.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {evt.attendees} Attending</span>
                  {evt.isVirtual && <span className="flex items-center gap-1 text-blue-400"><Video className="h-3 w-3" /> Virtual Available</span>}
                </div>
              </div>
              <div className="text-right sm:text-left">
                <p className="mb-2 font-mono text-sm text-emerald-400">{evt.date}</p>
                <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black hover:bg-accent/80 sm:w-auto">Register Now</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
