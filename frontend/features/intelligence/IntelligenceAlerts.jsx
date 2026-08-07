import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { ShieldAlert, Info, AlertTriangle, XCircle, Activity, Database, Clock, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@shared/lib/utils';

const INITIAL_ALERTS = [
  { id: 1, type: 'CRITICAL', msg: 'Quantum Research Lab activity dropped by 80% this week.', source: 'Research OS', timestamp: Date.now() - 300000 },
  { id: 2, type: 'HIGH', msg: 'Top creator @jane_doe is showing signs of burnout (reduced login frequency).', source: 'Marketplace', timestamp: Date.now() - 600000 },
  { id: 3, type: 'MEDIUM', msg: 'New opportunity: Rapid growth in Web3 course enrollments.', source: 'Academy', timestamp: Date.now() - 900000 },
  { id: 4, type: 'LOW', msg: 'Routine security scan completed.', source: 'System', timestamp: Date.now() - 1200000 },
];

const PERFORMANCE_METRICS = {
  apiLatency: { current: 45, average: 52, status: 'good' },
  dbOperations: { current: 234, average: 280, status: 'good' },
  errorRate: { current: 0.02, average: 0.05, status: 'good' },
  uptime: { current: 99.9, average: 99.8, status: 'good' },
};

const RECENT_LOGS = [
  { id: 1, level: 'INFO', message: 'User authentication successful', service: 'Auth', latency: 45, timestamp: Date.now() - 5000 },
  { id: 2, level: 'INFO', message: 'Database query completed', service: 'Database', latency: 23, timestamp: Date.now() - 10000 },
  { id: 3, level: 'WARN', message: 'High memory usage detected', service: 'System', latency: 0, timestamp: Date.now() - 15000 },
  { id: 4, level: 'INFO', message: 'API request processed', service: 'API Gateway', latency: 67, timestamp: Date.now() - 20000 },
  { id: 5, level: 'ERROR', message: 'Failed to connect to external service', service: 'Integration', latency: 120, timestamp: Date.now() - 25000 },
  { id: 6, level: 'INFO', message: 'Cache hit for user profile', service: 'Cache', latency: 2, timestamp: Date.now() - 30000 },
];

export default function IntelligenceAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [logs, setLogs] = useState(RECENT_LOGS);
  const [metrics] = useState(PERFORMANCE_METRICS);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        level: ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 5)],
        message: `System operation ${Math.random().toString(36).substring(7)}`,
        service: ['Auth', 'Database', 'API Gateway', 'Cache', 'System'][Math.floor(Math.random() * 5)],
        latency: Math.floor(Math.random() * 150),
        timestamp: Date.now()
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'MEDIUM': return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getLogIcon = (level) => {
    switch(level) {
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getLogBg = (level) => {
    switch(level) {
      case 'ERROR': return 'bg-red-500/10 border-red-500/20';
      case 'WARN': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const filteredLogs = filterLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === filterLevel);

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Intelligence Alerts"
        description="Real-time strategic alerts, performance metrics, and system diagnostics."
      />

      {/* Performance Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Good</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.apiLatency.current}ms</p>
            <p className="text-xs text-text-muted">API Latency (avg: {metrics.apiLatency.average}ms)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Good</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.dbOperations.current}</p>
            <p className="text-xs text-text-muted">DB Ops/min (avg: {metrics.dbOperations.average})</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Good</span>
            </div>
            <p className="text-2xl font-bold text-white">{(metrics.errorRate.current * 100).toFixed(2)}%</p>
            <p className="text-xs text-text-muted">Error Rate (avg: {(metrics.errorRate.average * 100).toFixed(2)}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Good</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.uptime.current}%</p>
            <p className="text-xs text-text-muted">Uptime (avg: {metrics.uptime.average}%)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strategic Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className={cn("flex items-start gap-4 p-4 rounded-xl border", getBg(alert.type))}>
                  <div className="mt-0.5">{getIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-bold uppercase tracking-widest", alert.type === 'CRITICAL' ? 'text-red-400' : 'text-text-muted')}>
                        {alert.type} PRIORITY
                      </span>
                      <span className="text-xs text-text-muted border-l border-border pl-2">{alert.source}</span>
                      <span className="text-xs text-text-muted ml-auto">{formatTime(alert.timestamp)}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{alert.msg}</p>
                  </div>
                  <button 
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs font-bold text-accent hover:underline shrink-0"
                  >
                    Acknowledge
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-text-muted">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2 text-emerald-400" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Logs</CardTitle>
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="h-8 rounded-lg border border-border bg-white/5 px-2 text-xs text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warnings</option>
                <option value="ERROR">Errors</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className={cn("flex items-start gap-3 p-3 rounded-lg border text-xs", getLogBg(log.level))}>
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{log.level}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">{log.service}</span>
                      {log.latency > 0 && (
                        <>
                          <span className="text-text-muted">·</span>
                          <span className="text-text-muted">{log.latency}ms</span>
                        </>
                      )}
                    </div>
                    <p className="text-text-soft truncate">{log.message}</p>
                  </div>
                  <span className="text-text-muted shrink-0">{formatTime(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
