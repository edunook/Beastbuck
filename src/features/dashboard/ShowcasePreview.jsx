import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Image as ImageIcon, Heart, MessageSquare, Eye, ExternalLink } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ShowcasePreview() {
  const { user } = useAuth();

  const uploads = [
    { id: 1, title: 'Abstract Art Collection', type: 'Images', likes: 1234, comments: 89, views: 5678, thumbnail: '🎨' },
    { id: 2, title: '3D Model Pack', type: '3D Models', likes: 890, comments: 45, views: 3456, thumbnail: '🧊' },
    { id: 3, title: 'UI Design System', type: 'UI Designs', likes: 2345, comments: 123, views: 8901, thumbnail: '🎯' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Showcase Preview" 
        description="Latest uploads including images, videos, likes, comments, and views with open showcase button."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {uploads.map((upload) => (
          <Card key={upload.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="text-5xl mb-4 text-center">{upload.thumbnail}</div>
              <h3 className="font-bold text-white text-lg mb-2">{upload.title}</h3>
              <p className="text-text-muted text-sm mb-4">{upload.type}</p>
              <div className="flex gap-4 text-sm text-text-muted mb-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{upload.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{upload.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{upload.views}</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Showcase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
