import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, AlertCircle, CheckCircle2, Send, Star, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';

const MOCK_REVIEWS = [
  {
    id: 1,
    reviewer: 'Dr. Sarah Chen',
    reviewerId: 'user1',
    rating: 4,
    status: 'approved',
    comment: 'Excellent methodology and clear presentation of results. The discussion section could be expanded with more recent literature.',
    timestamp: new Date(Date.now() - 86400000),
    helpful: 5,
  },
  {
    id: 2,
    reviewer: 'Prof. Michael Roberts',
    reviewerId: 'user2',
    rating: 5,
    status: 'approved',
    comment: 'Outstanding contribution to the field. The experimental design is rigorous and the findings are significant.',
    timestamp: new Date(Date.now() - 172800000),
    helpful: 8,
  },
];

export function PeerReviewPanel() {
  const { user, roleData } = useAuth();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [, setHelpfulVotes] = useState({});

  const handleSubmitReview = async () => {
    if (!newReview.trim() || rating === 0) return;
    
    setSubmitting(true);
    setTimeout(() => {
      const review = {
        id: Date.now(),
        reviewer: roleData?.displayName || user?.displayName || 'Anonymous',
        reviewerId: user?.uid,
        rating,
        status: 'pending',
        comment: newReview,
        timestamp: new Date(),
        helpful: 0,
      };
      setReviews(prev => [review, ...prev]);
      setNewReview('');
      setRating(0);
      setSubmitting(false);
    }, 1000);
  };

  const handleMarkHelpful = (reviewId) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          Peer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{averageRating}</p>
              <p className="text-xs text-text-muted">Average Rating</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-lg font-bold text-white">{reviews.length}</p>
              <p className="text-xs text-text-muted">Reviews</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted'}`}
              />
            ))}
          </div>
        </div>

        {/* Add Review Form */}
        {user && (
          <div className="space-y-4 p-4 bg-white/5 rounded-xl">
            <h3 className="font-bold text-white">Submit Your Review</h3>
            <div>
              <label className="text-sm font-bold text-white mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg transition ${
                      star <= rating ? 'text-yellow-400' : 'text-text-muted hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-white mb-2 block">Your Review</label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your thoughts on this research paper..."
                rows={4}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
              />
            </div>
            <Button onClick={handleSubmitReview} disabled={submitting || !newReview.trim() || rating === 0}>
              {submitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" />Submit Review</>}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white">Recent Reviews</h3>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <MessageSquare className="mx-auto h-12 w-12 mb-4" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="p-4 bg-white/5 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold">{review.reviewer.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{review.reviewer}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-text-muted">
                          {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(review.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.status === 'pending' && (
                    <span className="px-2 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full">
                      Pending
                    </span>
                  )}
                  {review.status === 'approved' && (
                    <span className="px-2 py-1 text-xs font-bold bg-green-500/10 text-green-400 rounded-full">
                      <CheckCircle2 className="inline h-3 w-3 mr-1" />
                      Approved
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-soft leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FeedbackPanel() {
  const { user, roleData } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const MOCK_FEEDBACK = [
      {
        id: 1,
        author: 'Dr. Emily Watson',
        authorId: 'user3',
        section: 'Methods',
        comment: 'Consider adding more detail about the sample size calculation.',
        timestamp: new Date(Date.now() - 43200000),
        resolved: false,
      },
      {
        id: 2,
        author: 'Prof. John Smith',
        authorId: 'user4',
        section: 'Discussion',
        comment: 'The limitations section could be more comprehensive.',
        timestamp: new Date(Date.now() - 129600000),
        resolved: true,
      },
    ];
    setFeedback(MOCK_FEEDBACK);
  }, []);

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      const item = {
        id: Date.now(),
        author: roleData?.displayName || user?.displayName || 'Anonymous',
        authorId: user?.uid,
        section: 'General',
        comment: newFeedback,
        timestamp: new Date(),
        resolved: false,
      };
      setFeedback(prev => [item, ...prev]);
      setNewFeedback('');
      setSubmitting(false);
    }, 1000);
  };

  const handleResolve = (feedbackId) => {
    setFeedback(prev => prev.map(f => 
      f.id === feedbackId ? { ...f, resolved: true } : f
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-accent" />
          Feedback & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Feedback Form */}
        {user && (
          <div className="space-y-3 p-4 bg-white/5 rounded-xl">
            <h3 className="font-bold text-white">Add Feedback</h3>
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Share your suggestions for improvement..."
              rows={3}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
            />
            <Button onClick={handleSubmitFeedback} disabled={submitting || !newFeedback.trim()} size="sm">
              {submitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" />Submit Feedback</>}
            </Button>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-3">
          <h3 className="font-bold text-white">Feedback Thread</h3>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>No feedback yet. Start the discussion!</p>
            </div>
          ) : (
            feedback.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  item.resolved 
                    ? 'border-green-500/30 bg-green-500/5 opacity-60' 
                    : 'border-border bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">{item.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{item.section}</span>
                        <span className="text-xs text-text-muted">
                          {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.resolved && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-soft mb-3">{item.comment}</p>
                {!item.resolved && (
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(item.id)}>
                    <CheckCircle2 className="mr-2 h-3 w-3" />
                    Mark as Resolved
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
