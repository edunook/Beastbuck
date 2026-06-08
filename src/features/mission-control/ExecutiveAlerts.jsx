import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, RefreshCw, ChevronRight } from 'lucide-react';
import { MissionControlService } from '../../services/firebase/missionControl';
import { IntelligencePanel, LoadingRows } from './missionControlUtils';
import { Link } from 'react-router-dom';

export default function ExecutiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await MissionControlService.getExecutiveAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load executive alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getIcon = (type) => {
    if (type === 'DANGER') return <AlertTriangle className="h-5 w-5 text-status-danger" />;
    if (type === 'WARNING') return <AlertCircle className="h-5 w-5 text-status-warning" />;
    return <Info className="h-5 w-5 text-accent" />;
  };

  const getStyles = (type) => {
    if (type === 'DANGER') return 'border-status-danger/30 bg-status-danger/5';
    if (type === 'WARNING') return 'border-status-warning/30 bg-status-warning/5';
    return 'border-accent/30 bg-accent/5';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Executive Alerts</h2>
          <p className="text-xs text-text-muted">Automatically surfaced critical issues requiring attention.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <IntelligencePanel title="Active Alerts" icon={AlertTriangle}>
        {loading ? <LoadingRows count={4} /> : (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-success/20 text-status-success">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-bold text-white">All Clear</p>
                <p className="mt-1 text-sm text-text-muted">No critical issues detected across the platform.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:brightness-110 ${getStyles(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getIcon(alert.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{alert.title}</h4>
                      <p className="mt-1 text-sm text-text-muted">{alert.message}</p>
                    </div>
                  </div>
                  {alert.actionLink && (
                    <Link
                      to={alert.actionLink}
                      className="flex shrink-0 items-center gap-1 self-start rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 sm:self-center"
                    >
                      Investigate <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </IntelligencePanel>
    </div>
  );
}
