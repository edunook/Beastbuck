import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Play, MessageSquare, Heart, Share2, Bookmark } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FunFlixService } from '@services/firestore/funflix';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';

export default function MoviePlayer() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [viewIncremented, setViewIncremented] = useState(false);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);

  // IPFS gateways for fallback (ordered by speed - Pinata first since file is pinned there)
  const IPFS_GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',  // Fastest - dedicated Pinata gateway
    'https://ipfs.io/ipfs/',              // Reliable public gateway
    'https://dweb.link/ipfs/',            // Fast public gateway
    'https://gateway.ipfs.io/ipfs/',      // Official IPFS gateway
  ];

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
    console.error('Video failed to load, trying next gateway');
    
    // Try next gateway if this is an IPFS URL
    if (video?.videoUrl && currentGatewayIndex < IPFS_GATEWAYS.length - 1) {
      const nextIndex = currentGatewayIndex + 1;
      setCurrentGatewayIndex(nextIndex);
    } else if (currentGatewayIndex >= IPFS_GATEWAYS.length - 1) {
      toast.error('Failed to load video from all gateways');
    }
  };

  const getVideoUrl = () => {
    if (!video?.videoUrl) return null;
    
    // If it's already an IPFS gateway URL, try to extract CID and use current gateway
    const ipfsMatch = video.videoUrl.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    if (ipfsMatch) {
      const cid = ipfsMatch[1];
      return `${IPFS_GATEWAYS[currentGatewayIndex]}${cid}`;
    }
    
    // If it's a direct CID (no gateway), use current gateway
    if (video.videoUrl.match(/^[a-zA-Z0-9]+$/)) {
      return `${IPFS_GATEWAYS[currentGatewayIndex]}${video.videoUrl}`;
    }
    
    // Otherwise return as-is (non-IPFS URL)
    return video.videoUrl;
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
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative group border border-border shadow-2xl mb-6">
          {currentVideoUrl ? (
            <video 
              key={currentGatewayIndex}
              className="w-full h-full"
              controls
              autoPlay
              src={currentVideoUrl}
              onError={handleVideoError}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-20 h-20 text-white/20" />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <span className="bg-white/10 text-text-muted text-xs px-2 py-1 rounded font-bold uppercase">{video.category}</span>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold uppercase">Members Only</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
            <p className="text-text-muted text-sm mb-6">{viewCount.toLocaleString()} views · {createdAt.toLocaleDateString()}</p>
            
            <div className="flex items-center justify-between border-y border-border/50 py-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-white font-bold">
                  {video.creatorName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{video.creatorName || video.creatorUsername || 'Creator'}</h3>
                  <p className="text-xs text-text-muted">Content Creator</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/40 border border-border rounded-xl p-4 text-sm text-text-muted leading-relaxed">
              {video.description || 'No description provided.'}
              {video.tags && video.tags.length > 0 && (
                <>
                  <br/><br/>
                  {video.tags.map(tag => `#${tag}`).join(' ')}
                </>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-surface/40 border border-border rounded-xl p-4 flex justify-around">
              <button 
                onClick={handleLike}
                className={`flex flex-col items-center gap-1 ${liked ? 'text-red-500' : 'text-white hover:text-accent'}`}
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likeCount}</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-blue-400">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs">Comments</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-emerald-400">
                <Bookmark className="w-6 h-6" />
                <span className="text-xs">Save</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-purple-400">
                <Share2 className="w-6 h-6" />
                <span className="text-xs">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
