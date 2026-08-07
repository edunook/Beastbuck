import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, EmptyState } from '@frontend/components/ui/UIElements';
import { cn } from '@shared/lib/utils';

export default function ProgramsHub() {
  const [programs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load programs from Firebase
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Programs Hub" 
        description="Discover and apply for official BeastBuck programs designed to accelerate research, startups, and community education."
        action={<Zap className="h-8 w-8 text-accent" />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Programs Yet"
          description="Global programs will be announced here. Check back for research grants, incubator programs, and mentorship opportunities."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs.map((prog, i) => (
            <div key={i} className="group relative rounded-2xl bg-surface/50 border border-border p-1 hover:border-accent/30 transition-colors backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className="bg-surface/80 rounded-xl p-6 h-full flex flex-col z-10 relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn("p-4 rounded-xl bg-gradient-to-br shadow-lg", prog.color)}>
                    <prog.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{prog.name}</h3>
                    <p className="text-accent font-medium text-sm">{prog.focus}</p>
                  </div>
                </div>
                
                <p className="text-text-muted flex-1 mb-6">{prog.desc}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    {prog.tags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 rounded text-xs font-medium bg-surface/50 text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors group/btn">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
