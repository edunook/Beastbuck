import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

export function EventsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadEvents = async () => {
      try {
        const { EventService } = await import('@services/firestore/events');
        const upcomingEvents = await EventService.getUpcomingEvents(3);
        if (!cancelled) {
          setEvents(upcomingEvents || []);
        }
      } catch (err) {
        console.warn('EventsWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadEvents();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-slate-950/20 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400 animate-pulse" />
              Upcoming Events
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-purple-500/20 bg-gradient-to-br from-slate-900/90 via-indigo-950/15 to-purple-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
          <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Calendar className="h-4 w-4" />
          </div>
          Community Events
        </CardTitle>
        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors group/link"
        >
          <span>Events Calendar</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState 
              type="generic"
              title="No upcoming events" 
              subtitle="Community town halls, tournaments, and labs will appear here!" 
            />
          </div>
        ) : (
          events.map((event, index) => {
            const spotsLeft = (event.maxParticipants || 50) - (event.participants?.length || 0);
            const isJoined = event.participants?.includes(user?.uid);
            
            return (
              <div
                key={event.id}
                onClick={() => navigate('/events')}
                className="group/event cursor-pointer relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/40 hover:bg-purple-500/[0.06] transition-all duration-300 p-3.5 hover:-translate-y-0.5"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-xs text-white group-hover/event:text-purple-300 transition-colors line-clamp-1">
                    {event.title}
                  </h4>
                  {event.xpReward && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[10px] font-black text-purple-300 shrink-0">
                      +{event.xpReward} XP
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3 text-purple-400" />
                      {event.date || 'Upcoming'}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3 w-3 text-indigo-400" />
                      {spotsLeft > 0 ? `${spotsLeft} seats` : 'Full'}
                    </span>
                  </div>
                  
                  <span className={`text-[10px] font-bold ${isJoined ? 'text-status-success flex items-center gap-1' : 'text-purple-300'}`}>
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Registered
                      </>
                    ) : (
                      'View Details →'
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}