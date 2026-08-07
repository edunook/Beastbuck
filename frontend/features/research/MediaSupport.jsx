import { FileImage, Video, Music, FileText, Package, Code, Archive, Box, Upload } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function MediaSupport() {
  const mediaTypes = [
    { type: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'tiff', 'ico', 'heic', 'heif'], icon: FileImage, color: 'purple' },
    { type: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'], icon: Video, color: 'cyan' },
    { type: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac'], icon: Music, color: 'amber' },
    { type: 'Documents', extensions: ['pdf', 'pptx', 'ppt', 'docx', 'doc'], icon: FileText, color: 'emerald' },
    { type: 'Spreadsheets', extensions: ['xlsx', 'xls', 'csv'], icon: Package, color: 'blue' },
    { type: 'Code Files', extensions: ['zip', 'code'], icon: Code, color: 'pink' },
    { type: 'Archives', extensions: ['zip', 'rar', '7z'], icon: Archive, color: 'red' },
    { type: '3D Models', extensions: ['obj', 'fbx', 'gltf'], icon: Box, color: 'orange' },
  ];

  const handleUpload = (type) => {
    // Simulated file upload
    alert(`Upload ${type} functionality would be implemented here`);
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400 hover:bg-pink-500/30',
      red: 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Media Support" 
        description="Upload and manage various media types for your research."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mediaTypes.map((media) => {
          const Icon = media.icon;
          return (
            <Card key={media.type} className="cursor-pointer hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${getColorClass(media.color)}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{media.type}</h3>
                  <p className="text-text-muted text-xs mb-4">
                    {media.extensions.join(', ').toUpperCase()}
                  </p>
                  <Button
                    onClick={() => handleUpload(media.type)}
                    size="sm"
                    variant="secondary"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Box className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Rich Media Support</h3>
              <p className="text-text-soft text-sm">
                Your research can contain images, videos, audio, PDFs, PowerPoint presentations, Excel spreadsheets, 
                CSV files, code files, ZIP archives, 3D models, and interactive HTML content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
