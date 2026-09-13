import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Play, MessageSquare, Heart, Share2, Bookmark } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FunFlixService } from '@services/firestore/funflix';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { normalizeMediaUrl } from '@services/storage/b2Client';

export default function MoviePlayer() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [viewIncremented, setViewIncremented] = useState(false);

  useEffect(() => {
    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const loadVideo = async () => {
    if (!movieId) {
      toast.error('Video ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const videoData = await FunFlixService.getVideo(movieId);
      if (!videoData) {
        toast.error('Video not found');
        return;
      }
      setVideo(videoData);
      
      // Check if user has liked
      if (user && videoData.likes?.includes(user.uid)) {
        setLiked(true);
      }

      // Increment views once per session
      if (!viewIncremented) {
        await FunFlixService.incrementViews(movieId);
        setViewIncremented(true);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like videos');
      return;
    }
    try {
      await FunFlixService.toggleLike(movieId, user.uid, liked);
      setLiked(!liked);
      toast.success(liked ? 'Like removed' : 'Video liked');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load from CDN.');
    toast.error('Video could not be loaded. Please try again later.');
  };

  /**
   * Resolve video URL exclusively through the B2/Cloudflare CDN pipeline.
   * normalizeMediaUrl() handles all legacy URL patterns:
   *   - Old Pinata/IPFS URLs → normalizeMediaUrl returns them unchanged (DB has been migrated)
   *   - B2 direct URLs → rewrites to CDN base
   *   - Storage object keys (media/...) → prepends CDN base
   */
  const getVideoUrl = () => {
    if (!video?.videoUrl) return null;
    return normalizeMediaUrl(video.videoUrl);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!video) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-muted">Video not found</p>
        </div>
      </PageContainer>
    );
  }

  const createdAt = video.createdAt?.toDate?.() || new Date();
  const likeCount = video.likes?.length || 0;
  const viewCount = video.views || 0;
  const currentVideoUrl = getVideoUrl();

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-border/20 shadow-2xl shadow-black/50 mb-8 ring-1 ring-white/10">
          {currentVideoUrl ? (
            <video 
              key={currentVideoUrl}
              className="w-full h-full"
              controls
              autoPlay
              src={currentVideoUrl}
              onError={handleVideoError}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface/20 to-background-500">
              <Play className="w-24 h-24 text-white/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <span className="bg-accent/20 text-accent text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide">{video.category}</span>
              <span className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide">Members Only</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{video.title}</h1>
            <p className="text-text-muted text-sm mb-8 flex items-center gap-2">
              <span>{viewCount.toLocaleString()} views</span>
              <span className="w-1 h-1 bg-text-muted rounded-full"></span>
              <span>{createdAt.toLocaleDateString()}</span>
            </p>
            
            <div className="flex items-center gap-4 mb-8 p-4 bg-surface/30 rounded-xl border border-border/30">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-alt flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
                {video.creatorName?.charAt(0) || video.creatorUsername?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{video.creatorName || video.creatorUsername || 'Creator'}</h3>
                <p className="text-xs text-text-muted mt-0.5">Content Creator</p>
              </div>
            </div>

            <div className="bg-surface/30 border border-border/30 rounded-xl p-5 text-sm text-text-muted leading-relaxed">
              {video.description || 'No description provided.'}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-2">
                  {video.tags.map(tag => (
                    <span key={tag} className="bg-white/5 text-text-muted px-2 py-1 rounded text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-surface/30 border border-border/30 rounded-2xl p-5 flex justify-around shadow-lg">
              <button 
                onClick={handleLike}
                className={`flex flex-col items-center gap-2 transition-all duration-200 ${liked ? 'text-red-500 scale-110' : 'text-white hover:text-accent hover:scale-105'}`}
              >
                <div className={`p-2 rounded-full ${liked ? 'bg-red-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
                  <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs font-medium">{likeCount}</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-all duration-200 hover:scale-105">
                <div className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Comments</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-white hover:text-emerald-400 transition-all duration-200 hover:scale-105">
                <div className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <Bookmark className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Save</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-white hover:text-purple-400 transition-all duration-200 hover:scale-105">
                <div className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
