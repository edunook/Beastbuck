import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Award, Zap, BookOpen, Users, Rocket, Target } from 'lucide-react';

const AWARDS = [
  { title: 'Global Innovator', desc: 'Awarded to members who create breakthrough technological advancements.', icon: Zap, color: 'text-yellow-400', recipients: 12 },
  { title: 'Master Researcher', desc: 'Recognizing individuals with highly cited, peer-reviewed publications.', icon: BookOpen, color: 'text-blue-400', recipients: 45 },
  { title: 'Ecosystem Builder', desc: 'For extraordinary contributions to growing global communities.', icon: Users, color: 'text-emerald-400', recipients: 89 },
  { title: 'Venture Pioneer', desc: 'Founders who have successfully scaled a venture globally.', icon: Rocket, color: 'text-purple-400', recipients: 34 },
];

export default function RecognitionCenter() {
  return (
    <PageContainer>
      <PageHeader title="Global Recognition System" description="Discover the highest honors awarded within the BeastBuck Ecosystem." />

      <div className="grid gap-4 sm:grid-cols-2">
        {AWARDS.map((award, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm transition-all hover:border-white/20">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 ${award.color}`}>
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-white">{award.title}</h3>
              <p className="mb-3 text-sm text-text-muted">{award.desc}</p>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Target className="h-4 w-4 text-text-muted" />
                <span className="text-white">{award.recipients} Global Recipients</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
