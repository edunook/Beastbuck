import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BookOpen, Download } from 'lucide-react';

const SDKS = [
  { name: 'JavaScript SDK', lang: 'Node.js / Browser', version: 'v2.4.1', downloads: '145K', icon: 'JS', docs: '#' },
  { name: 'Python SDK', lang: 'Python 3.8+', version: 'v1.2.0', downloads: '89K', icon: 'PY', docs: '#' },
  { name: 'React Native SDK', lang: 'React Native', version: 'v0.9.4', downloads: '34K', icon: 'RN', docs: '#' },
  { name: 'Go SDK', lang: 'Go 1.18+', version: 'v1.0.2', downloads: '12K', icon: 'GO', docs: '#' },
];

export default function SDKCenter() {
  return (
    <PageContainer>
      <PageHeader title="SDKs & Libraries" description="Official client libraries for interacting with the BeastBuck API." />

      <div className="grid gap-4 sm:grid-cols-2">
        {SDKS.map((sdk, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono font-bold text-accent">
                {sdk.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{sdk.name}</h3>
                <p className="text-xs text-text-muted">{sdk.lang} · {sdk.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted"><Download className="mr-1 inline-block h-3 w-3" />{sdk.downloads}</span>
              <a href={sdk.docs} className="inline-flex items-center gap-1 rounded bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10">
                <BookOpen className="h-3 w-3" /> Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading text-lg font-bold text-white">Quick Start (Node.js)</h3>
        <div className="rounded-lg bg-[#0d1117] p-4 font-mono text-sm">
          <p className="text-text-muted"># Install the package</p>
          <p className="text-emerald-400">npm install @beastbuck/sdk</p>
          <br />
          <p className="text-text-muted">// Initialize the client</p>
          <p className="text-pink-400">import <span className="text-white">{"{ BeastBuck }"}</span> from <span className="text-yellow-300">'@beastbuck/sdk'</span>;</p>
          <br />
          <p className="text-blue-400">const <span className="text-white">bb =</span> new <span className="text-emerald-300">BeastBuck</span><span className="text-white">('YOUR_API_KEY')</span>;</p>
          <p className="text-blue-400">const <span className="text-white">user =</span> await <span className="text-white">bb.users.</span><span className="text-yellow-200">getCurrent</span><span className="text-white">()</span>;</p>
          <p className="text-white">console.<span className="text-yellow-200">log</span>(user);</p>
        </div>
      </div>
    </PageContainer>
  );
}
