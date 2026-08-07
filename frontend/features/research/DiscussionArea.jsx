import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { MessageSquare, Send, Heart, Pin, ThumbsUp, MessageCircle, Smile, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function DiscussionArea() {
  const { user } = useAuth();
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Dr. Sarah Chen',
      content: 'Great research! I particularly liked your methodology section. Have you considered adding more recent references?',
      likes: 23,
      replies: 5,
      isPinned: true,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      author: 'Alex Johnson',
      content: 'This is very interesting! Could you elaborate on the statistical analysis used?',
      likes: 15,
      replies: 3,
      isPinned: false,
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      author: 'Emma Williams',
      content: 'I have a question about the sample size. Was it sufficient for statistical significance?',
      likes: 8,
      replies: 2,
      isPinned: false,
      timestamp: '1 day ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        author: user?.displayName || 'You',
        content: newComment,
        likes: 0,
        replies: 0,
        isPinned: false,
        timestamp: 'Just now',
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const handleLike = (commentId) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Discussion Area" 
        description="Engage with the research community through comments, questions, and polls."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or ask a question..."
              className="flex-1"
            />
            <Button onClick={handlePostComment}>
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white">{comment.author}</span>
                    {comment.isPinned && (
                      <span className="flex items-center gap-1 text-accent text-xs">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                    <span className="text-text-muted text-sm">{comment.timestamp}</span>
                  </div>
                  <p className="text-text-soft mb-4">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-2 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{comment.replies} Replies</span>
                    </button>
                    <button className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>React</span>
                    </button>
                    <button className="text-text-muted hover:text-accent transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <span className="text-white text-sm">Comments</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <MessageCircle className="h-5 w-5 text-cyan-400" />
              <span className="text-white text-sm">Questions</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <ThumbsUp className="h-5 w-5 text-emerald-400" />
              <span className="text-white text-sm">Polls</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Smile className="h-5 w-5 text-amber-400" />
              <span className="text-white text-sm">Emoji Reactions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
