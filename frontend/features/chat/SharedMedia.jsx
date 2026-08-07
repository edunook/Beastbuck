import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Image as ImageIcon, Video, FileText, Link, Mic, Download, Filter } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function SharedMedia() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'links', label: 'Links', icon: Link },
    { id: 'voice', label: 'Voice Notes', icon: Mic },
  ];

  const mediaItems = [
    { id: 1, type: 'images', name: 'Screenshot.png', size: '2.4 MB', date: '2 hours ago', thumbnail: '🖼️' },
    { id: 2, type: 'videos', name: 'Demo.mp4', size: '15.6 MB', date: '5 hours ago', thumbnail: '🎬' },
    { id: 3, type: 'files', name: 'Document.pdf', size: '1.2 MB', date: '1 day ago', thumbnail: '📄' },
    { id: 4, type: 'links', name: 'Research Paper', size: 'Link', date: '2 days ago', thumbnail: '🔗' },
    { id: 5, type: 'voice', name: 'Voice Note.mp3', size: '3.4 MB', date: '3 days ago', thumbnail: '🎙️' },
    { id: 6, type: 'images', name: 'Design.png', size: '4.8 MB', date: '4 days ago', thumbnail: '🎨' },
    { id: 7, type: 'files', name: 'Report.docx', size: '856 KB', date: '5 days ago', thumbnail: '📝' },
    { id: 8, type: 'videos', name: 'Tutorial.mp4', size: '45.2 MB', date: '1 week ago', thumbnail: '📹' },
  ];

  const filteredItems = selectedFilter === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === selectedFilter);

  const getIcon = (type) => {
    switch (type) {
      case 'images': return ImageIcon;
      case 'videos': return Video;
      case 'files': return FileText;
      case 'links': return Link;
      case 'voice': return Mic;
      default: return FileText;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'images': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'videos': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'files': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'links': return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
      case 'voice': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      default: return 'bg-white/5 border-border text-text-muted';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Shared Media" 
        description="Dedicated media section showing all shared content without scrolling through chat history."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    selectedFilter === filter.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-white/5 text-text-muted hover:border-accent/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <Card key={item.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-6xl mb-4">
                  {item.thumbnail}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase mb-2 ${getColorClass(item.type)}`}>
                  <Icon className="h-3 w-3" />
                  {item.type}
                </div>
                <h3 className="font-bold text-white text-sm mb-1 truncate">{item.name}</h3>
                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span>{item.size}</span>
                  <span>{item.date}</span>
                </div>
                <Button size="sm" variant="secondary" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
