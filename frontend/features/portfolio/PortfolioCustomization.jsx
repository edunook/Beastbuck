import { useState } from 'react';
import { Palette, Image as ImageIcon, Layout, Layers, Sparkles, Zap, Box } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function PortfolioCustomization() {
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [backgroundTheme, setBackgroundTheme] = useState('dark');
  const [cardStyle, setCardStyle] = useState('glass');
  const [layout, setLayout] = useState('grid');
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableGlassEffects, setEnableGlassEffects] = useState(true);

  const accentColors = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
  ];

  const backgroundThemes = ['dark', 'light', 'gradient', 'aurora'];
  const cardStyles = ['glass', 'solid', 'bordered', 'minimal'];
  const layouts = ['grid', 'list', 'masonry', 'timeline'];

  return (
    <PageContainer>
      <PageHeader 
        title="Portfolio Customization" 
        description="Customization options including accent color, cover image, background theme, card style, layout, widget order, animations, and glass effects with automatic saving."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700">
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Accent Color</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setAccentColor(color.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    accentColor === color.value ? 'border-accent' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Cover Image</h3>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-all cursor-pointer">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-text-muted" />
              <p className="text-text-muted mb-2">Click to upload cover image</p>
              <p className="text-text-muted text-xs">Recommended: 1920x600px</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Box className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Background Theme</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {backgroundThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setBackgroundTheme(theme)}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    backgroundTheme === theme ? 'border-accent bg-accent/10' : 'border-border'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Card Style</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cardStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => setCardStyle(style)}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    cardStyle === style ? 'border-accent bg-accent/10' : 'border-border'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Layout</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {layouts.map((layoutOption) => (
                <button
                  key={layoutOption}
                  onClick={() => setLayout(layoutOption)}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    layout === layoutOption ? 'border-accent bg-accent/10' : 'border-border'
                  }`}
                >
                  {layoutOption}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Effects</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Animations</span>
                </div>
                <button
                  onClick={() => setEnableAnimations(!enableAnimations)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    enableAnimations ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                    enableAnimations ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-text-muted" />
                  <span className="text-white">Glass Effects</span>
                </div>
                <button
                  onClick={() => setEnableGlassEffects(!enableGlassEffects)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    enableGlassEffects ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                    enableGlassEffects ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
