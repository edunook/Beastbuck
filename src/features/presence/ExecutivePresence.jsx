import { useState } from 'react';
import { Crown } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ExecutivePresence() {
  const [executiveIndicatorEnabled, setExecutiveIndicatorEnabled] = useState(true);

  return (
    <PageContainer>
      <PageHeader 
        title="Executive Presence" 
        description="CEO and Co-CEO optional executive indicators with disable option."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Executive Presence</h3>
            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              CEO / Co-CEO Only
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-400" />
              <div>
                <p className="text-white font-bold">Executive Indicator</p>
                <p className="text-text-muted text-sm">Show special crown icon for CEO and Co-CEO</p>
              </div>
            </div>
            <button
              onClick={() => setExecutiveIndicatorEnabled(!executiveIndicatorEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${executiveIndicatorEnabled ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-all ${executiveIndicatorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white">Executive Features</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-white">Special crown icon next to name</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-white">Gold accent color for presence</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-white">Priority in member lists</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-white">Can be disabled for privacy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Preview</h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-3xl">👑</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">CEO Name</p>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-text-muted text-sm">Chief Executive Officer</p>
            </div>
            <div className="ml-auto">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Settings
      </Button>
    </PageContainer>
  );
}
