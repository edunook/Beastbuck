import { useState, useEffect } from 'react';
import { db } from '../../../services/firebase/config';
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Activity, Clock, Flame } from 'lucide-react';
import { DynamicEmptyState } from '../../../components/dashboard/DynamicEmptyStates';

function formatTimeAgo(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return 'Just now';

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentActivityPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  const fetchLogs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const logsRef = collection(db, 'activityLogs');
      let q;
      
      if (isLoadMore && lastDoc) {
        q = query(logsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      } else {
        q = query(logsRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      }

      const snap = await getDocs(q);
      
      if (snap.empty) {
        if (!isLoadMore) {
          setLogs([]);
        }
        setHasMore(false);
      } else {
        const nextLogs = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLastDoc(snap.docs[snap.docs.length - 1]);
        
        if (isLoadMore) {
          setLogs(prev => [...prev, ...nextLogs]);
        } else {
          setLogs(nextLogs);
        }

        if (snap.docs.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card className="group h-full border border-white/10 bg-gradient-to-br from-accent/5 to-purple-500/5 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
            <Activity className="h-4 w-4 text-accent animate-pulse" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            <div className="h-12 animate-pulse rounded-xl bg-white/5 border border-white/10" />
            <div className="h-12 animate-pulse rounded-xl bg-white/5 border border-white/10" />
          </div>
        )}

        {!loading && logs.length === 0 && (
          <DynamicEmptyState type="activity" />
        )}

        {!loading && logs.length > 0 && (
          <div className="space-y-4">
            <div className="relative border-l border-white/15 pl-4 ml-3 space-y-5">
              {logs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="relative group/item transition-all duration-300 hover:translate-x-1"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms both` }}
                >
                  {/* Timeline indicator node */}
                  <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-accent shadow-[0_0_8px_#00f2fe] transition-transform duration-300 group-hover/item:scale-125" />
                  
                  <div>
                    <p className="text-sm font-bold text-white group-hover/item:text-accent transition-colors">
                      {log.summary || 'System event'}
                    </p>
                    <span className="mt-1 text-xs text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                disabled={loadingMore}
                onClick={() => fetchLogs(true)}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Activity</span>
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
