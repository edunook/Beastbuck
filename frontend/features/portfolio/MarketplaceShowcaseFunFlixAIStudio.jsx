import { ShoppingCart, Image as ImageIcon, Film, Bot, MessageSquare, Heart, Eye } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function MarketplaceShowcaseFunFlixAIStudio() {
  const marketplace = [
    { id: 1, name: 'React Dashboard Template', type: 'Template', sales: 234, rating: 4.8 },
    { id: 2, name: 'AI Icon Pack', type: 'Digital Asset', sales: 567, rating: 4.9 },
    { id: 3, name: 'Custom Development', type: 'Service', sales: 45, rating: 5.0 },
  ];

  const showcase = [
    { id: 1, title: 'Abstract Art Collection', type: 'Art', likes: 1234, comments: 89, views: 5678 },
    { id: 2, title: '3D Model Pack', type: '3D Models', likes: 890, comments: 45, views: 3456 },
    { id: 3, title: 'UI Design System', type: 'UI Designs', likes: 2345, comments: 123, views: 8901 },
  ];

  const funflix = [
    { id: 1, title: 'Comedy Shorts', type: 'Comedy', views: 12345, likes: 2345, comments: 567, watchTime: '456h', awards: ['Trending'] },
    { id: 2, title: 'Tech Tutorial Series', type: 'Education', views: 8901, comments: 234, watchTime: '234h', awards: ['Featured'] },
  ];

  const aiStudio = [
    { id: 1, name: 'Research Assistant', category: 'Education', score: 92, users: 1234, chats: 5678, rating: 4.7, description: 'Helps with research papers' },
    { id: 2, name: 'Code Reviewer', category: 'Development', score: 88, users: 890, chats: 3456, rating: 4.5, description: 'Reviews code quality' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Marketplace, Showcase, FunFlix, AI Studio" 
        description="Auto-populated sections displaying products, templates, digital assets, services (Marketplace), images, videos, 3D models, designs, art, photography, UI designs, animations (Showcase), comedy shorts, movies, challenges, series, collaborations, views, likes, comments, watch time, awards (FunFlix), AI name, category, creator score, users, chats, ratings, description, open chat button (AI Studio)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-accent" />
              Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {marketplace.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'Template' ? 'bg-purple-500/20 text-purple-400' :
                    item.type === 'Digital Asset' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-text-muted text-sm">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-bold">{item.sales} Sales</p>
                    <p className="text-amber-400 text-sm">★ {item.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-accent" />
              Showcase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {showcase.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="text-3xl">🎨</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-text-muted text-sm">{item.type}</p>
                  </div>
                  <div className="flex gap-3 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{item.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-accent" />
            FunFlix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {funflix.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="text-3xl">🎬</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-text-muted text-sm">{item.type}</p>
                </div>
                <div className="flex gap-3 text-sm text-text-muted">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{item.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{item.comments}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.awards.map((award) => (
                    <span key={award} className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                      {award}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            AI Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {aiStudio.map((ai) => (
              <div key={ai.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{ai.name}</h3>
                  <p className="text-text-muted text-sm">{ai.category}</p>
                  <p className="text-text-muted text-xs">{ai.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">Score: {ai.score}</p>
                  <p className="text-text-muted text-sm">{ai.users} users</p>
                  <p className="text-text-muted text-sm">{ai.chats} chats</p>
                  <p className="text-amber-400 text-sm">★ {ai.rating}</p>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
