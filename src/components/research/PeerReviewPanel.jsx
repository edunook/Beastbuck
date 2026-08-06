import { useState } from 'react';
import { MessageSquare, Send, Reply, ThumbsUp, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../features/auth/AuthContext';

export function PeerReviewPanel({ paperId, paperTitle }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Dr. Sarah Chen',
      text: 'The methodology section is well-structured. However, I suggest adding more statistical analysis to support your conclusions.',
      timestamp: new Date(Date.now() - 86400000),
      replies: [
        {
          id: '1-1',
          author: 'Author',
          text: 'Thank you for the feedback! We will include additional statistical analysis in the revision.',
          timestamp: new Date(Date.now() - 43200000),
        },
      ],
      upvotes: 3,
      isHelpful: false,
    },
    {
      id: '2',
      author: 'Prof. Michael Roberts',
      text: 'Excellent work on the literature review. The citations are comprehensive and relevant.',
      timestamp: new Date(Date.now() - 172800000),
      replies: [],
      upvotes: 5,
      isHelpful: true,
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      author: user?.displayName || 'Anonymous',
      text: newComment,
      timestamp: new Date(),
      replies: [],
      upvotes: 0,
      isHelpful: false,
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: `${commentId}-${Date.now()}`,
      author: user?.displayName || 'Anonymous',
      text: replyText,
      timestamp: new Date(),
    };
    
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply],
        };
      }
      return comment;
    }));
    
    setReplyText('');
    setReplyingTo(null);
  };

  const handleUpvote = (commentId) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          upvotes: comment.upvotes + 1,
        };
      }
      return comment;
    }));
  };

  const markHelpful = (commentId) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isHelpful: !comment.isHelpful,
        };
      }
      return comment;
    }));
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          Peer Review Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Add Your Review</p>
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your feedback on this research paper..."
              className="flex-1"
            />
            <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="space-y-3">
              <div className={`p-4 rounded-xl border ${comment.isHelpful ? 'border-green-500/40 bg-green-500/10' : 'border-border bg-white/[0.03]'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{comment.author}</span>
                      {comment.isHelpful && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Helpful
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">{formatDate(comment.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvote(comment.id)}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-accent"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {comment.upvotes}
                    </button>
                    <button
                      onClick={() => markHelpful(comment.id)}
                      className="text-xs text-text-muted hover:text-green-400"
                    >
                      {comment.isHelpful ? 'Unmark' : 'Mark Helpful'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-text-soft">{comment.text}</p>
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="mt-2 flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 space-y-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="p-3 rounded-lg border border-border bg-black/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{reply.author}</span>
                        <span className="text-xs text-text-muted">{formatDate(reply.timestamp)}</span>
                      </div>
                      <p className="text-sm text-text-soft">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="ml-8 flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No peer reviews yet. Be the first to provide feedback!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
