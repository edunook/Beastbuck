import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Sparkles, Lightbulb, MessageSquare, BarChart3, Send, Heart, Share2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function DiscoveryFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'fact',
      content: 'Did you know? Octopuses have three hearts and blue blood! 🐙',
      author: 'ScienceFan',
      likes: 234,
      comments: 45,
    },
    {
      id: 2,
      type: 'discovery',
      content: 'Just discovered that plants can communicate through underground fungal networks! 🌱',
      author: 'NatureExplorer',
      likes: 567,
      comments: 89,
    },
    {
      id: 3,
      type: 'meme',
      content: 'When your experiment finally works after 50 attempts 😂🔬',
      author: 'LabLife',
      likes: 892,
      comments: 156,
    },
    {
      id: 4,
      type: 'news',
      content: 'New breakthrough in quantum computing could revolutionize AI! 🚀',
      author: 'TechNews',
      likes: 445,
      comments: 78,
    },
    {
      id: 5,
      type: 'experiment',
      content: 'Quick experiment: Try the mentos and soda reaction - it\'s explosive! 🥤💥',
      author: 'QuickScience',
      likes: 321,
      comments: 67,
    },
  ]);
  const [newPost, setNewPost] = useState('');
  const [selectedType, setSelectedType] = useState('fact');

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts([
      {
        id: Date.now(),
        type: selectedType,
        content: newPost,
        author: user?.displayName || 'You',
        likes: 0,
        comments: 0,
      },
      ...posts,
    ]);
    setNewPost('');
  };

  const getTypeIcon = (type) => {
    const icons = {
      fact: Sparkles,
      discovery: Lightbulb,
      meme: MessageSquare,
      news: BarChart3,
      experiment: Sparkles,
    };
    return icons[type] || Sparkles;
  };

  const getTypeColor = (type) => {
    const colors = {
      fact: 'text-purple-400 bg-purple-500/20',
      discovery: 'text-amber-400 bg-amber-500/20',
      meme: 'text-pink-400 bg-pink-500/20',
      news: 'text-cyan-400 bg-cyan-500/20',
      experiment: 'text-emerald-400 bg-emerald-500/20',
    };
    return colors[type] || colors.fact;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Discovery Feed" 
        description="Share interesting facts, tiny discoveries, research memes, and more!"
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white/5 border border-border rounded-xl px-4 py-2 text-white focus:border-accent focus:outline-none transition-colors"
            >
              <option value="fact">Interesting Fact</option>
              <option value="discovery">Tiny Discovery</option>
              <option value="meme">Research Meme</option>
              <option value="news">Science News</option>
              <option value="experiment">Quick Experiment</option>
            </select>
            <Input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something interesting..."
              className="flex-1"
            />
            <Button onClick={handlePost}>
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => {
          const Icon = getTypeIcon(post.type);
          return (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(post.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">{post.author}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getTypeColor(post.type)}`}>
                        {post.type}
                      </span>
                    </div>
                    <p className="text-text-soft mb-4">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-text-muted hover:text-red-400 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
