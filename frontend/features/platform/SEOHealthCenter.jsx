import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Search, Globe, Link as LinkIcon, FileText } from 'lucide-react';

export default function SEOHealthCenter() {
  return (
    <PageContainer>
      <PageHeader title="SEO & Discoverability" description="Monitor search engine visibility, structured data, and metadata health." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Indexed Pages', value: '45.2K', icon: Globe, color: 'text-blue-400' },
          { label: 'Organic Traffic', value: '+12%', icon: Search, color: 'text-emerald-400' },
          { label: 'Broken Links', value: '3', icon: LinkIcon, color: 'text-red-400' },
          { label: 'Metadata Errors', value: '0', icon: FileText, color: 'text-emerald-400' }
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/40 p-6 backdrop-blur-sm shadow-depth-1">
        <h3 className="mb-4 text-section-title font-heading font-bold text-white">Route SEO Diagnostics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="py-2 text-caption font-semibold">Route Pattern</th>
              <th className="py-2">Meta Tags</th>
              <th className="py-2">Open Graph</th>
              <th className="py-2">Canonical</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { route: '/research/paper/:id', meta: 'Dynamic', og: 'Valid', canonical: 'Set', status: 'Excellent' },
              { route: '/marketplace/product/:id', meta: 'Dynamic', og: 'Valid', canonical: 'Set', status: 'Excellent' },
              { route: '/ventures/:id', meta: 'Dynamic', og: 'Valid', canonical: 'Set', status: 'Excellent' },
            ].map((r, i) => (
              <tr key={i} className="border-b border-border/20 text-white last:border-0">
                <td className="py-3 font-mono text-xs">{r.route}</td>
                <td className="py-3 text-emerald-400">{r.meta}</td>
                <td className="py-3 text-emerald-400">{r.og}</td>
                <td className="py-3 text-emerald-400">{r.canonical}</td>
                <td className="py-3"><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase text-emerald-400">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </PageContainer>
  );
}
