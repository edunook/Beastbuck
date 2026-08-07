import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Upload, FileText, BookOpen, Database, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AITrainingCenter() {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const fileTypes = [
    { id: 'pdf', name: 'PDF Documents', icon: FileText, color: 'red', extensions: '.pdf' },
    { id: 'docx', name: 'Word Documents', icon: FileText, color: 'blue', extensions: '.docx' },
    { id: 'txt', name: 'Text Files', icon: FileText, color: 'gray', extensions: '.txt' },
    { id: 'md', name: 'Markdown', icon: FileText, color: 'purple', extensions: '.md' },
    { id: 'research', name: 'Research Papers', icon: BookOpen, color: 'emerald', extensions: 'Research' },
    { id: 'articles', name: 'Knowledge Articles', icon: BookOpen, color: 'cyan', extensions: 'Articles' },
    { id: 'projects', name: 'Projects', icon: Database, color: 'amber', extensions: 'Projects' },
    { id: 'experiments', name: 'Experiments', icon: Database, color: 'pink', extensions: 'Experiments' },
    { id: 'faqs', name: 'FAQs', icon: BookOpen, color: 'violet', extensions: 'FAQs' },
    { id: 'web', name: 'Website Pages', icon: FileText, color: 'teal', extensions: 'Web' },
    { id: 'notes', name: 'Notes', icon: FileText, color: 'orange', extensions: 'Notes' },
    { id: 'presentations', name: 'Presentations', icon: FileText, color: 'rose', extensions: 'PPTX' },
    { id: 'images', name: 'Images (OCR)', icon: ImageIcon, color: 'indigo', extensions: 'PNG, JPG' },
    { id: 'videos', name: 'Videos (Future)', icon: Video, color: 'sky', extensions: 'Future' },
  ];

  const getColorClass = (color) => {
    const colors = {
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
    };
    return colors[color] || colors.purple;
  };

  const handleUpload = (type) => {
    setUploadedFiles([...uploadedFiles, { id: Date.now(), type, name: `New ${type} file`, status: 'processing' }]);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Training Center" 
        description="Upload knowledge to train your AI with various file types and sources."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            <Upload className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">Drag & Drop Files</h3>
            <p className="text-text-muted mb-4">or click to browse</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {fileTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id} className="hover:border-accent/50 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(type.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{type.name}</h3>
                <p className="text-text-muted text-sm mb-4">{type.extensions}</p>
                <Button
                  onClick={() => handleUpload(type.name)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Upload
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{file.name}</h3>
                    <p className="text-text-muted text-sm">{file.type}</p>
                  </div>
                  <span className="text-text-muted text-sm">Processing...</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
