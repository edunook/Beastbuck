import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sparkles, Layers, Box, MousePointer2, Zap, Image, Sparkles as SparklesIcon, Navigation, Scroll, Loader2, BarChart3, Sun, Layout, FileText, Smartphone } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function DesignPhilosophy() {
  const { user } = useAuth();

  const features = [
    { id: 'aurora', name: 'Animated Aurora Backgrounds', icon: Sparkles, color: 'purple' },
    { id: 'glass', name: 'Glassmorphism', icon: Layers, color: 'cyan' },
    { id: 'liquid', name: 'Liquid Gradient Cards', icon: Box, color: 'emerald' },
    { id: '3d', name: '3D Hover Effects', icon: MousePointer2, color: 'amber' },
    { id: 'glow', name: 'Movie Poster Glow', icon: Zap, color: 'pink' },
    { id: 'particles', name: 'Particle Effects', icon: SparklesIcon, color: 'red' },
    { id: 'lights', name: 'Floating Lights', icon: Sun, color: 'blue' },
    { id: 'cinematic', name: 'Cinematic Hero', icon: Image, color: 'violet' },
    { id: 'parallax', name: 'Parallax Scrolling', icon: Scroll, color: 'orange' },
    { id: 'depth', name: 'Depth Animations', icon: Layers, color: 'teal' },
    { id: 'blur', name: 'Smooth Blur Transitions', icon: Box, color: 'rose' },
    { id: 'skeleton', name: 'Premium Skeleton Loaders', icon: Loader2, color: 'indigo' },
    { id: 'counters', name: 'Animated Counters', icon: BarChart3, color: 'sky' },
    { id: 'shimmer', name: 'Shimmer Effects', icon: Sparkles, color: 'lime' },
    { id: 'lighting', name: 'Dynamic Background Lighting', icon: Sun, color: 'fuchsia' },
    { id: 'nav', name: 'Floating Navigation', icon: Navigation, color: 'yellow' },
    { id: 'motion', name: 'Ultra Smooth Motion', icon: Zap, color: 'orange' },
    { id: 'typography', name: 'Modern Typography', icon: FileText, color: 'pink' },
    { id: 'empty', name: 'Beautiful Empty States', icon: Layout, color: 'cyan' },
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
      orange: 'bg-orange-500/20 border-orange-500/30 border-orange-400',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
      rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      sky: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      lime: 'bg-lime-500/20 border-lime-500/30 text-lime-400',
      fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Design Philosophy" 
        description="Premium design with animated aurora backgrounds, glassmorphism, liquid gradient cards, 3D hover effects, and more."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(feature.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white">{feature.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
