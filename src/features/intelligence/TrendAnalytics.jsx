import { useEffect, useState } from 'react';
import { LineChart } from 'lucide-react';
import { IntelligenceService } from '../../services/firebase/intelligence';

const TrendAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  
  useEffect(() => {
    async function loadTrends() {
      try {
        let t = await IntelligenceService.analyzeTrends();
        if (t && t.skills) {
          setTrends(t.skills);
        }
      } catch (error) {
        console.error("Error loading trends:", error);
      }
      setLoading(false);
    }
    loadTrends();
  }, []);
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Trend Analytics
        </h1>
        <p className="text-muted-foreground mt-2">Macro-level ecosystem trajectory tracking.</p>
      </div>

      {/* Main Chart Area */}
      <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="text-purple-400 w-5 h-5" />
            Platform Activity Index
          </h2>
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
        </div>

        {/* Dynamic Data Chart from Trends */}
        <div className="h-64 flex items-end gap-2 mt-4 px-2">
          {loading ? (
             <div className="w-full text-center text-text-muted self-center">Loading trends...</div>
          ) : trends.length === 0 ? (
             <div className="w-full text-center text-text-muted self-center">No trend data available.</div>
          ) : (
            trends.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end group">
                <div className="text-center text-xs text-white/50 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {val.momentum}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-purple-500/50 to-pink-500 rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${Math.min(100, Math.max(10, val.momentum))}%` }}
                />
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2">
          {trends.map(t => (
            <span key={t.name}>{t.name}</span>
          ))}
        </div>
      </div>

      {/* Specific Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md">
          <h3 className="font-medium text-gray-300 mb-2">Learning Trends</h3>
          <div className="text-2xl font-bold text-white mb-4">+142% <span className="text-sm font-normal text-green-400 ml-2">↑ AI Courses</span></div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 w-[70%]" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md">
          <h3 className="font-medium text-gray-300 mb-2">Research Trends</h3>
          <div className="text-2xl font-bold text-white mb-4">84 <span className="text-sm font-normal text-green-400 ml-2">↑ Published</span></div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 w-[55%]" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface/40 border border-white/10 backdrop-blur-md">
          <h3 className="font-medium text-gray-300 mb-2">Startup Trends</h3>
          <div className="text-2xl font-bold text-white mb-4">$12M <span className="text-sm font-normal text-green-400 ml-2">↑ Capital Deployed</span></div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 w-[85%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalytics;
