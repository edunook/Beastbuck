import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { BookOpen, Code2, Users, LayoutDashboard, Search } from 'lucide-react';

const DOCS = [
  { title: 'Architecture Overview', category: 'Engineering', icon: Code2, count: 12 },
  { title: 'API Reference', category: 'Developer', icon: Search, count: 45 },
  { title: 'Admin Playbooks', category: 'Operations', icon: LayoutDashboard, count: 8 },
  { title: 'Community Guidelines', category: 'User Facing', icon: Users, count: 5 },
];

export default function DocumentationCenter() {
  return (
    <PageContainer>
      <PageHeader title="Documentation System" description="Central repository for architectural, developer, and operational documentation." />
      
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DOCS.map((doc, i) => (
          <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:bg-white/5">
            <div className="mb-4 text-accent">
              <doc.icon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">{doc.title}</h3>
              <p className="text-xs text-text-muted">{doc.category}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-text-muted">
              <span>{doc.count} Articles</span>
              <button className="text-white hover:text-accent font-bold">View →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm flex flex-col items-center justify-center text-center py-12">
        <BookOpen className="w-12 h-12 text-text-muted mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Generate Documentation</h3>
        <p className="text-sm text-text-muted max-w-md mb-6">Use the AI Documentation Agent to automatically scan the codebase and generate updated Developer and Admin documentation.</p>
        <button className="bg-accent text-black font-bold px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
          Run Documentation Generator
        </button>
      </div>
    </PageContainer>
  );
}
