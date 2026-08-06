import { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader, EmptyState } from '../../components/ui/UIElements';
import { cn } from '../../lib/utils';

export default function InstitutionHub() {
  const institutions = [];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load institutions from Firebase
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Institution Directory" 
        description="Official partnerships with leading Schools, Universities, Labs, and Nonprofits driving innovation together."
        action={<ShieldCheck className="h-8 w-8 text-accent" />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : institutions.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Partners Yet"
          description="Institution partnerships will be listed here as they are established."
        />
      ) : (
        <>
          <div className="flex space-x-2 overflow-x-auto pb-4 hide-scrollbar">
            {['All', 'Universities', 'Research Labs', 'Nonprofits', 'Enterprise'].map((filter, i) => (
              <button key={i} className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                i === 0 ? "bg-accent text-black" : "bg-surface/40 text-text-muted hover:bg-surface/60 border border-border"
              )}>
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((inst, i) => (
              <div key={i} className="group flex flex-col rounded-2xl border border-border bg-surface/40 p-6 hover:bg-surface/60 transition-all backdrop-blur-md">
                <div className="flex items-start justify-between mb-6">
                  <div className={cn("p-3 rounded-xl border", inst.bg, inst.border, inst.color)}>
                    <inst.icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface/50 text-text-muted border border-border">
                    {inst.type}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{inst.name}</h3>
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Collaborative Programs</p>
                    <div className="flex flex-wrap gap-2">
                      {inst.programs.map((prog, j) => (
                        <span key={j} className="px-2 py-1 bg-surface/50 text-text-muted rounded text-xs">
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <button className="flex items-center text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                    View Partnership Details <ExternalLink className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
