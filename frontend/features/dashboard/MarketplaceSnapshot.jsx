import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ShoppingCart, Package, BriefcaseBusiness, Award, DollarSign, Star } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function MarketplaceSnapshot() {
  const { user } = useAuth();

  const metrics = [
    { id: 'published', name: 'Products Published', value: 15, icon: Package, color: 'purple' },
    { id: 'sold', name: 'Products Sold', value: 234, icon: ShoppingCart, color: 'cyan' },
    { id: 'services', name: 'Services', value: 5, icon: BriefcaseBusiness, color: 'emerald' },
    { id: 'level', name: 'Creator Level', value: 42, icon: Award, color: 'amber' },
    { id: 'reputation', name: 'Reputation', value: 4.8, icon: Star, color: 'pink' },
    { id: 'credits', name: 'Credits Earned', value: 5678, icon: DollarSign, color: 'red' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Marketplace Snapshot" 
        description="Marketplace overview including products published, products sold, services, creator level, reputation, and credits earned."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(metric.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold text-accent">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
