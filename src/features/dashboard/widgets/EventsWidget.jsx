import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowRight, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';

export function EventsWidget() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    const loadEvents = async () => {
      try {
        const { EventService } = await import('../../../services/firebase/events');
        const upcomingEvents = await EventService.getUpcomingEvents(3);
        setEvents(upcomingEvents || []);
      } catch (err) {
        console.log('Events load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="group h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Calendar className="h-4 w-4 text-purple-400" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
              <Calendar className="h-4 w-4 text-purple-400" />
            </div>
            Upcoming Events
          </div>
          <button className="flex items-center gap-1 text-xs font-bold text-accent hover:text-purple-300 transition-colors">
            <span>View All</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 && (
          <DynamicEmptyState 
            type="generic"
            title="No events scheduled yet" 
            subtitle="Stay tuned for upcoming community events!" 
          />
        )}
        
        <div className="space-y-3">
          {events.map((event, index) => {
            const spotsLeft = (event.maxParticipants || 50) - (event.participants?.length || 0);
            const isAlmostFull = spotsLeft <= 5;
            
            return (
              <div
                key={event.id}
                className="group/event relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-500 group-hover/event:opacity-100 group-hover/event:translate-x-full" />
                
                <div className="relative p-4">
                  <h4 className="font-bold text-sm text-white mb-2 line-clamp-1">{event.title}</h4>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{event.date || 'Today'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-text-muted">
                      <Users className="h-3.5 w-3.5" />
                      <span>{spotsLeft} spots left</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-xs font-bold text-purple-300">
                      {event.xpReward || 100} XP
                    </span>
                    
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-accent hover:bg-purple-500/10 transition-all duration-300">
                      <span>Join</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {isAlmostFull && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-status-warning/10 text-xs font-bold text-status-warning">
                      Almost Full!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}