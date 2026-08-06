import { useState } from 'react';
import { Sun, Moon, Monitor, Palette, Layers, Type, Layout, Zap } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AppearanceSettings() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('purple');
  const [glassEffects, setGlassEffects] = useState(true);
  const [animationLevel, setAnimationLevel] = useState('medium');
  const [fontSize, setFontSize] = useState('medium');
  const [cardDensity, setCardDensity] = useState('comfortable');
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const accentColors = [
    { name: 'Purple', value: 'purple', color: '#8B5CF6' },
    { name: 'Cyan', value: 'cyan', color: '#06B6D4' },
    { name: 'Emerald', value: 'emerald', color: '#10B981' },
    { name: 'Amber', value: 'amber', color: '#F59E0B' },
    { name: 'Pink', value: 'pink', color: '#EC4899' },
    { name: 'Red', value: 'red', color: '#EF4444' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Appearance Settings" 
        description="Appearance options including light theme, dark theme, system theme, accent colors, glass effects, animation level, font size, card density, compact mode, and reduced motion."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-accent" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'light' ? 'border-accent bg-accent/10' : 'border-border'}`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-accent bg-accent/10' : 'border-border'}`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'system' ? 'border-accent bg-accent/10' : 'border-border'}`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-accent" />
              Accent Color
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${accentColor === color.value ? 'border-accent' : 'border-border'}`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent" />
              Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white">Glass Effects</span>
                <button
                  onClick={() => setGlassEffects(!glassEffects)}
                  className={`w-12 h-6 rounded-full transition-all ${glassEffects ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${glassEffects ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white">Reduced Motion</span>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-all ${reducedMotion ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${reducedMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Animation Level
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  onClick={() => setAnimationLevel(level.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all ${animationLevel === level.toLowerCase() ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-accent" />
              Font Size
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {['Small', 'Medium', 'Large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all ${fontSize === size.toLowerCase() ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-accent" />
              Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Card Density</label>
                <select
                  value={cardDensity}
                  onChange={(e) => setCardDensity(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white">Compact Mode</span>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`w-12 h-6 rounded-full transition-all ${compactMode ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${compactMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Changes
      </Button>
    </PageContainer>
  );
}
