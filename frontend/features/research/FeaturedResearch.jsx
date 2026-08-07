import { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, MessageSquare, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function FeaturedResearch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = () => {
    // Simulated featured research data
    setFeatured([
      {
        id: 1,
        title: 'Revolutionary AI for Climate Prediction',
        author: 'Dr. Sarah Chen',
        category: 'Best Research',
        icon: '🏆',
        likes:1234,
        comments: 89,
        color: 'emerald',
      },
      {
        id: 2,
        title: 'Biodegradable Plastics from Algae',
        author: 'Alex Johnson',
        category: 'Trending',
        icon: '📈',
        likes: 890,
        comments: 67,
        color: 'purple',
      },
      {
        id: 3,
        title: 'Quantum Computing for Drug Discovery',
        author: 'Prof. Michael Lee',
        category: "Editor's Choice",
        icon: '⭐',
        likes: 567,
        comments: 45,
        color: 'amber',
      },
      {
        id: 4,
        title: 'AI-Powered Personalized Learning',
        author: 'Emma Williams',
        category: 'Most Innovative',
        icon: '💡',
        likes: 445,
        comments: 34,
        color: 'cyan',
      },
      {
        id: 5,
        title: 'Sustainable Energy from Ocean Waves',
        author: 'James Brown',
        category: 'Teen Choice',
        icon: '🎯',
        likes: 678,
        comments: 56,
        color: 'pink',
      },
      {
        id: 6,
        title: 'Machine Learning for Wildlife Conservation',
        author: 'Lisa Anderson',
        category: 'Most Discussed',
        icon: '💬',
        likes: 789,
        comments: 123,
        color: 'red',
      },
      {
        id: 7,
        title: 'Newest: Smart Cities with IoT',
        author: 'David Kim',
        category: 'Newest',
        icon: '🆕',
        likes: 234,
        comments: 23,
        color: 'blue',
      },
    ]);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Featured Research" 
        description="Discover the best and trending research papers!"
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-6 w-6 text-emerald-400" />
              <span className="text-2xl font-bold text-white">Best Research</span>
            </div>
            <p className="text-text-muted text-sm">Top quality research papers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Trending</span>
            </div>
            <p className="text-text-muted text-sm">Most popular right now</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Editor's Choice</span>
            </div>
            <p className="text-text-muted text-sm">Curated by our editors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <Button onClick={prevSlide} size="sm" variant="secondary">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-text-muted text-sm">
                {currentIndex + 1} / {featured.length}
              </span>
              <Button onClick={nextSlide} size="sm" variant="secondary">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {featured.length > 0 && (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/20">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{featured[currentIndex].icon}</span>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getColorClass(featured[currentIndex].color)}`}>
                        {featured[currentIndex].category}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{featured[currentIndex].title}</h2>
                    <p className="text-text-muted mb-4">by {featured[currentIndex].author}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Heart className="h-4 w-4" />
                        <span>{featured[currentIndex].likes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <MessageSquare className="h-4 w-4" />
                        <span>{featured[currentIndex].comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {featured.map((item, index) => (
          <Card 
            key={item.id} 
            className={`cursor-pointer transition-all ${index === currentIndex ? 'border-accent/50 bg-accent/5' : 'hover:border-accent/30'}`}
            onClick={() => setCurrentIndex(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${getColorClass(item.color)}`}>
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.title}</h3>
              <p className="text-text-muted text-xs">{item.author}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
