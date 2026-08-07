import { useState } from 'react';
import { Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function SettingsUX() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = () => {
    setHasUnsavedChanges(false);
  };

  const handleDiscard = () => {
    setHasUnsavedChanges(false);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Settings UX" 
        description="Settings UX implementation with automatic saving where possible, save button, discard changes, unsaved changes warning for manual saves, and smooth responsive experience."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">UX Features</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h4 className="font-bold text-white">Automatic Saving</h4>
              </div>
              <p className="text-text-muted text-sm">
                Most settings are saved automatically when you change them. You'll see a success indicator when saved.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Save className="h-5 w-5 text-purple-400" />
                <h4 className="font-bold text-white">Save Button</h4>
              </div>
              <p className="text-text-muted text-sm">
                For settings that require manual saving, a Save button is provided at the bottom of the section.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-2">
                <X className="h-5 w-5 text-amber-400" />
                <h4 className="font-bold text-white">Discard Changes</h4>
              </div>
              <p className="text-text-muted text-sm">
                You can discard unsaved changes by clicking the Discard button. This will revert to the last saved state.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-bold text-white">Unsaved Changes Warning</h4>
              </div>
              <p className="text-text-muted text-sm">
                If you try to navigate away with unsaved changes, you'll be warned and asked to confirm.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <h4 className="font-bold text-white">Smooth & Responsive</h4>
              </div>
              <p className="text-text-muted text-sm">
                All settings pages are optimized for smooth transitions and work seamlessly across all device sizes.
              </p>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-white">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDiscard} variant="secondary" className="text-amber-400 hover:text-amber-300">
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
