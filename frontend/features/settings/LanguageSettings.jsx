import { useState } from 'react';
import { Globe, Languages } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'german', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'chinese', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'japanese', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'korean', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'arabic', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'portuguese', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'italian', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Language Settings" 
        description="Language support (future) with multiple languages and instant switching."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Select Language</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedLanguage === lang.code 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-bold text-white">{lang.name}</p>
                  <p className="text-text-muted text-sm">{lang.nativeName}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Translation Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">English</span>
              <span className="text-emerald-400 text-sm">100%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Spanish</span>
              <span className="text-amber-400 text-sm">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">French</span>
              <span className="text-amber-400 text-sm">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-white">Other Languages</span>
              <span className="text-amber-400 text-sm">Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Changes
      </Button>
    </PageContainer>
  );
}
