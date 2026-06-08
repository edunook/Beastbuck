import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Plus, Rocket, Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { VenturesService, VentureVisibility } from '../../services/firebase/ventures';

function mapVenture(v) {
  return {
    id: v.id,
    name: v.title || v.name || 'Untitled Venture',
    industry: v.industry || v.category || 'Innovation',
    stage: v.lifecycleStage || v.stage || 'IDEA',
    members: v.stats?.membersCount || v.members?.length || 0,
    funding: v.fundingSimulation?.totalSimulatedValue || 0,
  };
}

function VentureSection({ title, icon: Icon, items, colorClass }) {
  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(v => (
          <Link key={v.id} to={`/ventures/${v.id}`} className="group block">
            <Card className="h-full border-border bg-surface/50 transition-all hover:border-accent group-hover:-translate-y-1">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent bg-accent/20 text-xl font-bold text-accent">
                    {v.name.charAt(0)}
                  </div>
                  <span className="rounded border border-border bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-text-muted">
                    {v.stage}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-white transition-colors group-hover:text-accent">{v.name}</h3>
                <p className="mb-4 text-xs uppercase text-text-muted">{v.industry}</p>
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <span className="flex items-center gap-1 text-sm font-medium text-text-muted">
                    <Users className="h-4 w-4" /> {v.members}
                  </span>
                  {v.funding > 0 && (
                    <span className="text-sm font-bold text-green-400">${v.funding.toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function VenturesHub() {
  const [ventures, setVentures] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await VenturesService.getVenturesByVisibility([
          VentureVisibility.PUBLIC_SHOWCASE,
          VentureVisibility.ORGANIZATION_VISIBLE,
        ], 30);
        setVentures(data.map(mapVenture));
      } catch {
        setVentures([]);
      }
    })();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Venture Ecosystem"
        description="Launch startups, incubate ideas, and build the future of business."
        hero={true}
        action={
          <div className="flex gap-2">
            <Link to="/ventures/explore">
              <Button variant="secondary"><Search className="mr-2 h-4 w-4" /> Explore</Button>
            </Link>
            <Link to="/venture-builder">
              <Button className="bg-accent text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Plus className="mr-2 h-4 w-4" /> Build Venture
              </Button>
            </Link>
          </div>
        }
      />

      <VentureSection title="Featured Ventures" icon={Rocket} items={ventures.slice(0, 3)} colorClass="text-accent" />
      <VentureSection title="Fastest Growing" icon={TrendingUp} items={ventures.slice(1, 4)} colorClass="text-green-400" />
      <VentureSection title="AI Recommended" icon={Sparkles} items={ventures.slice(0, 2)} colorClass="text-purple-400" />

      <div className="mb-8 mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link to="/incubator" className="group rounded-2xl border border-border bg-gradient-to-br from-surface to-surface/50 p-6 transition-all hover:border-purple-500">
          <BriefcaseBusiness className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-white">Incubator OS</h3>
          <p className="mt-2 text-sm text-text-muted">Structured venture building pipeline.</p>
        </Link>
      </div>
    </PageContainer>
  );
}
