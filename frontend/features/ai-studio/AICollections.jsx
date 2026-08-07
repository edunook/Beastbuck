import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FolderOpen, Share2, Lock, Globe, GraduationCap, Code, BriefcaseBusiness, FlaskConical, BookOpen, Heart, Sparkles } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function AICollections() {
  const { user } = useAuth();

  const collections = [
    { id: 'education', name: 'Education Pack', icon: GraduationCap, color: 'purple', items: 45, isPublic: true, description: 'Educational AI models' },
    { id: 'programming', name: 'Programming Pack', icon: Code, color: 'cyan', items: 67, isPublic: true, description: 'Coding assistants' },
    { id: 'startup', name: 'Startup Pack', icon: BriefcaseBusiness, color: 'emerald', items: 23, isPublic: false, description: 'Business-focused AI' },
    { id: 'research', name: 'Research Pack', icon: FlaskConical, color: 'amber', items: 34, isPublic: true, description: 'Research tools' },
    { id: 'healthcare', name: 'Healthcare Pack', icon: Heart, color: 'pink', items: 18, isPublic: false, description: 'Medical assistants' },
    { id: 'business', name: 'Business Pack', icon: BriefcaseBusiness, color: 'red', items: 56, isPublic: true, description: 'Business solutions' },
    { id: 'language', name: 'Language Pack', icon: Globe, color: 'blue', items: 89, isPublic: true, description: 'Language models' },
    { id: 'study', name: 'Study Pack', icon: BookOpen, color: 'violet', items: 72, isPublic: true, description: 'Study helpers' },
    { id: 'fun', name: 'Fun Pack', icon: Sparkles, color: 'orange', items: 31, isPublic: true, description: 'Entertainment AI' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Collections" 
        description="Organize your AI models into themed collections with public sharing options."
        hero={true}
        action={
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FolderOpen className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const Icon = collection.icon;
          return (
            <Card key={collection.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(collection.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{collection.name}</h3>
                  {collection.isPublic ? (
                    <Globe className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="text-text-muted text-sm mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold">{collection.items} Items</span>
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
