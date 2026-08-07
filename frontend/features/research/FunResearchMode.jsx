import { useState } from 'react';
import { Sparkles, BookOpen, Lightbulb, Smile, Play, X } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function FunResearchMode() {
  const [showModal, setShowModal] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    setLoading(true);
    // Simulated AI simplification
    setTimeout(() => {
      setSimplifiedContent({
        story: "Imagine your research is like a superhero story! Your main character (the problem you're solving) faces a big challenge. Your research is the special power they discover to save the day! 🦸‍♂️",
        cartoon: "🎬 Picture this: A fun cartoon showing your research concept as colorful characters solving puzzles together!",
        simpleExample: "Think of it like making a sandwich - you need bread (your problem), fillings (your research), and putting it all together (your solution)!",
        funnyComparison: "Your research is like comparing a cat to a dog - they're both awesome but in totally different ways! 🐱🐕",
        realWorldExample: "In real life, this is like how your phone battery works - it stores energy just like your research stores knowledge!",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Fun Research Mode" 
        description="Explain Like I'm 12 - Turn complex research into fun, easy-to-understand content!"
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI-Powered Simplification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <BookOpen className="h-5 w-5 text-purple-400" />
                <span className="text-white">Stories</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <span className="text-white">Cartoons</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <span className="text-white">Simple Examples</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Smile className="h-5 w-5 text-emerald-400" />
                <span className="text-white">Funny Comparisons</span>
              </div>
            </div>

            <Button onClick={handleSimplify} disabled={loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Simplifying...' : 'Simplify My Research'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-bold text-accent mb-2">1. Upload Research</h4>
                <p className="text-text-soft text-sm">Paste your research text or upload a document</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-bold text-purple-400 mb-2">2. AI Magic</h4>
                <p className="text-text-soft text-sm">Our AI transforms complex ideas into fun content</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-bold text-emerald-400 mb-2">3. Share & Learn</h4>
                <p className="text-text-soft text-sm">Share your simplified research with everyone!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simplification Result Modal */}
      {showModal && simplifiedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-2xl w-full bg-background border border-border rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">🎉 Your Research Made Simple!</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Story Version
                </h3>
                <p className="text-text-soft">{simplifiedContent.story}</p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Cartoon Idea
                </h3>
                <p className="text-text-soft">{simplifiedContent.cartoon}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Simple Example
                </h3>
                <p className="text-text-soft">{simplifiedContent.simpleExample}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  Funny Comparison
                </h3>
                <p className="text-text-soft">{simplifiedContent.funnyComparison}</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <h3 className="font-bold text-accent mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Real-World Example
                </h3>
                <p className="text-text-soft">{simplifiedContent.realWorldExample}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90">
                Share This! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
