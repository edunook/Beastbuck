import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Star, Filter, Clock, CheckCircle2, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { cn } from '../../lib/utils';
import { MarketplaceService } from '../../services/firebase/marketplace';

export default function ServicesMarketplace() {
  const [activeTab, setActiveTab] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const tabs = ['All', 'Mentorship', 'Consulting', 'Design', 'Engineering', 'Research'];

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await MarketplaceService.getServices();
        setServices(data || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (s) => activeTab === 'All' || s.category === activeTab
  );


  return (
    <PageContainer>
      <PageHeader
        title="Services Marketplace"
        description="Hire top BeastBuck creators for mentorship, consulting, design, engineering, and research assistance."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]">
            <Briefcase className="h-4 w-4" />
            Offer a Service
          </button>
        }
      />

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors",
                activeTab === tab 
                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]" 
                  : "border-border bg-surface/50 text-text-muted hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full rounded-xl border border-border bg-surface/40 py-2 pl-9 pr-4 text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2 text-text-soft hover:text-white">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-text-muted">
          No services found in this category.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface/40 p-5 transition-all hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.15)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
            {service.category}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
            <Star className="h-3 w-3 fill-yellow-400" />
            {service.rating || 0} ({service.reviews || 0})
          </div>
        </div>
        
        <h3 className="mb-2 font-heading text-lg font-bold text-white line-clamp-2">
          {service.title}
        </h3>
        
        <p className="mb-4 text-sm text-text-soft line-clamp-2">
          {service.description}
        </p>
      </div>
      
      <div className="mt-4 border-t border-border/50 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <Link to={`/creator/${service.creator?.username || ''}`} className="flex items-center gap-2 group-hover:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white shadow-sm">
              {service.creator?.name?.charAt(0) || '?'}
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-sm font-bold text-white">
                {service.creator?.name || 'Unknown Creator'}
                {service.creator?.verified && <CheckCircle2 className="h-3 w-3 text-blue-400" />}
              </span>
              <span className="text-[10px] text-text-muted">@{service.creator?.username || 'unknown'}</span>
            </div>
          </Link>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs font-bold text-text-muted">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {service.duration || 'Flexible'}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-accent" /> {service.type || 'SERVICE'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Starting at</p>
            <p className="font-heading text-xl font-black text-white">
              {(service.price || 0).toLocaleString()} <span className="text-sm font-bold text-text-muted">{service.currency || 'Credits'}</span>
            </p>
          </div>
          
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-accent hover:text-black">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
