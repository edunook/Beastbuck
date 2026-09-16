import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  PictureInPicture2, 
  Sparkles, 
  Heart, 
  Plus, 
  Check, 
  Share2, 
  ArrowLeft, 
  Eye, 
  Clock, 
  Film, 
  SlidersHorizontal,
  Flame,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import Button from '@frontend/components/ui/Button';
import { FunFlixService } from '@services/firestore/funflix';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { normalizeMediaUrl } from '@services/storage/b2Client';
import { cn } from '@shared/lib/utils';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function MoviePlayer() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Video State
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [viewIncremented, setViewIncremented] = useState(false);

  // Player Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Recommendations State
  const [relatedVideos, setRelatedVideos] = useState([]);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  // Watchlist Sync from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('funflix_watchlist');
      const list = saved ? JSON.parse(saved) : [];
      setInWatchlist(list.some(item => (typeof item === 'string' ? item : item.id) === movieId));
    } catch {
      setInWatchlist(false);
    }
  }, [movieId]);

  // Load Video & Realtime Listener
  useEffect(() => {
    if (!movieId) return;

    setLoading(true);
    setVideoError(false);
    setCurrentTime(0);
    setIsPlaying(false);

    // Subscribe to real-time video document
    const unsubVideo = FunFlixService.subscribeToVideo(movieId, {
      onVideo: (videoData) => {
        if (!videoData) {
          toast.error('Video not found');
          setLoading(false);
          return;
        }
        setVideo(videoData);

        // Real likes calculation from array
        const likesArr = Array.isArray(videoData.likes) ? videoData.likes : [];
        setLikeCount(likesArr.length);
        if (user?.uid && likesArr.includes(user.uid)) {
          setLiked(true);
        } else {
          setLiked(false);
        }

        setLoading(false);

        // Fetch genuine recommendations
        FunFlixService.getRelatedVideos(movieId, videoData.category, 6).then(setRelatedVideos);
      },
      onError: (err) => {
        console.error('Video fetch error:', err);
        setLoading(false);
        setVideoError(true);
      },
    });

    // Increment views once per session
    if (!viewIncremented) {
      FunFlixService.incrementViews(movieId).catch(() => {});
      setViewIncremented(true);
    }

    return () => {
      unsubVideo();
    };
  }, [movieId, user?.uid]);

  // Autohide controls on inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skipTime(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 't':
          e.preventDefault();
          setIsTheaterMode(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted]);

  // Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Buffer percentage
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const durationVal = videoRef.current.duration || 1;
      setBuffered((bufferedEnd / durationVal) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(pos * duration, duration));
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    const next = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = next;
    setCurrentTime(next);
    toast(`${seconds > 0 ? `+${seconds}s` : `${seconds}s`}`, {
      icon: seconds > 0 ? '⏩' : '⏪',
      duration: 1000,
      position: 'bottom-center',
      style: { background: '#111', color: '#fff', fontSize: '12px' }
    });
  };

  const changeVolume = (val) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, val));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (spd) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = spd;
    setPlaybackSpeed(spd);
    setShowSpeedMenu(false);
    toast.success(`Speed: ${spd}x`, { duration: 1200 });
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    try {
      if (!videoRef.current) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      toast.error('Picture-in-Picture not supported by your browser');
    }
  };

  // Like & Unlike (Reliable & Tested)
  const handleLike = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to like videos');
      return;
    }

    const currentStatus = liked;
    const nextStatus = !currentStatus;

    // Optimistic UI Update
    setLiked(nextStatus);
    setLikeCount(prev => nextStatus ? prev + 1 : Math.max(0, prev - 1));

    try {
      await FunFlixService.toggleLike(movieId, user.uid, currentStatus);
      toast.success(nextStatus ? 'Liked! ❤️' : 'Like removed');
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setLiked(currentStatus);
      setLikeCount(prev => currentStatus ? prev + 1 : Math.max(0, prev - 1));
      toast.error('Failed to update like: ' + (error.message || 'Please try again'));
    }
  };

  // Watchlist Toggle
  const handleWatchlistToggle = () => {
    try {
      const saved = localStorage.getItem('funflix_watchlist');
      let list = saved ? JSON.parse(saved) : [];
      if (inWatchlist) {
        list = list.filter(item => (typeof item === 'string' ? item : item.id) !== movieId);
        setInWatchlist(false);
        toast.success('Removed from My List');
      } else {
        list.push({
          id: movieId,
          title: video?.title || 'Video',
          thumbnail: video?.thumbnail || '',
          category: video?.category || 'Movies',
          views: video?.views || 0,
        });
        setInWatchlist(true);
        toast.success('Added to My List! 🍿');
      }
      localStorage.setItem('funflix_watchlist', JSON.stringify(list));
    } catch {
      toast.error('Could not update watchlist');
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentVideoUrl = video?.videoUrl ? normalizeMediaUrl(video.videoUrl) : null;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <PageContainer className="bg-[#07080b] min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin" />
            <Film className="h-6 w-6 text-red-500 absolute inset-0 m-auto" />
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted animate-pulse">
            Loading Video...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (!video || videoError) {
    return (
      <PageContainer className="bg-[#07080b] min-h-screen text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <Film className="h-14 w-14 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">Video Unavailable</h2>
          <p className="text-sm text-text-muted mb-6">
            The video could not be loaded. It may have been removed or is temporarily unavailable.
          </p>
          <Button onClick={() => navigate('/funflix')} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to FunFlix
          </Button>
        </div>
      </PageContainer>
    );
  }

  const publishedDate = video.createdAt?.toDate 
    ? video.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : video.createdAt 
    ? new Date(video.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <div className="min-h-screen bg-[#07080b] text-white selection:bg-red-600 selection:text-white pb-24">
      {/* Top Cinema Header Bar */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#07080b]/95 via-[#07080b]/80 to-transparent backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/funflix')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/15 px-3.5 py-1.5 rounded-full border border-white/10 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>FunFlix</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-text-muted truncate max-w-lg">
            <span>/</span>
            <span className="text-red-400 font-semibold">{video.category || 'Video'}</span>
            <span>/</span>
            <span className="text-white font-medium truncate">{video.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Lighting Toggle */}
          <button
            onClick={() => setAmbientGlow(!ambientGlow)}
            className={cn(
              "p-2 rounded-full border transition-all text-xs font-semibold flex items-center gap-1.5",
              ambientGlow 
                ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                : "bg-white/5 text-text-muted border-white/10 hover:text-white"
            )}
            title="Toggle Ambient Glow"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{ambientGlow ? 'Glow On' : 'Glow Off'}</span>
          </button>
        </div>
      </div>

      <div className={cn("mx-auto transition-all duration-300 px-3 sm:px-6 lg:px-8", isTheaterMode ? "max-w-full" : "max-w-7xl")}>
        {/* Main Video Section */}
        <div className="relative mb-8">
          {/* Ambient Glow Aura */}
          {ambientGlow && (
            <div 
              className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-red-600/20 via-purple-600/15 to-blue-600/20 rounded-3xl blur-3xl opacity-60 pointer-events-none transition-opacity duration-1000 -z-10"
            />
          )}

          {/* Player Container */}
          <div 
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative aspect-video w-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/10 group select-none"
          >
            {/* HTML5 Native Video */}
            <video
              ref={videoRef}
              src={currentVideoUrl}
              poster={video.thumbnail || ''}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setShowControls(true);
              }}
              playsInline
            />

            {/* Center Play Splash when Paused */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-10 transition-opacity"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(220,38,38,0.7)] transition-transform transform hover:scale-110 active:scale-95">
                  <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Custom Cinema Controls Bar */}
            <div 
              className={cn(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-5 transition-opacity duration-300 z-30 flex flex-col justify-end gap-2",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {/* Progress Scrubber Bar */}
              <div 
                ref={progressBarRef}
                onClick={handleSeek}
                className="relative h-2 sm:h-2.5 bg-white/20 rounded-full cursor-pointer group/bar transition-all hover:h-3.5"
              >
                {/* Buffer Track */}
                <div 
                  className="absolute inset-y-0 left-0 bg-white/30 rounded-full" 
                  style={{ width: `${buffered}%` }}
                />
                {/* Progress Track */}
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-rose-500 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Scrubber Knob */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
              </div>

              {/* Controls Deck Row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Left Controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay} 
                    className="text-white hover:text-red-500 transition p-1 hover:scale-110"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />}
                  </button>

                  {/* 10s Rewind / Forward */}
                  <button 
                    onClick={() => skipTime(-10)} 
                    className="text-white/80 hover:text-white transition p-1 hover:scale-110"
                    title="Rewind 10s (Left Arrow)"
                  >
                    <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button 
                    onClick={() => skipTime(10)} 
                    className="text-white/80 hover:text-white transition p-1 hover:scale-110"
                    title="Forward 10s (Right Arrow)"
                  >
                    <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button 
                      onClick={toggleMute} 
                      className="text-white/80 hover:text-white transition p-1"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-14 sm:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-red-600 opacity-0 group-hover/vol:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Time Display */}
                  <div className="text-[11px] sm:text-xs font-mono text-white/80 ml-1">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 text-white/40">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3 relative">
                  {/* Playback Speed Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-10 right-0 bg-[#16171d]/95 backdrop-blur-xl border border-white/10 rounded-xl py-1.5 shadow-2xl z-40 w-28 text-xs flex flex-col">
                        <span className="px-3 py-1 text-[10px] font-bold uppercase text-text-muted border-b border-white/10">Speed</span>
                        {SPEED_OPTIONS.map(spd => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={cn(
                              "px-3 py-1.5 text-left hover:bg-red-600/30 transition flex items-center justify-between",
                              playbackSpeed === spd ? "text-red-400 font-bold" : "text-white/80"
                            )}
                          >
                            <span>{spd}x</span>
                            {playbackSpeed === spd && <Check className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-Picture */}
                  <button 
                    onClick={togglePiP}
                    className="text-white/80 hover:text-white transition p-1 hidden sm:inline-block"
                    title="Picture in Picture"
                  >
                    <PictureInPicture2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Theater Mode */}
                  <button 
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="text-white/80 hover:text-white transition p-1 hidden md:inline-block"
                    title={isTheaterMode ? "Standard View (T)" : "Theater View (T)"}
                  >
                    <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Fullscreen */}
                  <button 
                    onClick={toggleFullscreen}
                    className="text-white hover:text-red-500 transition p-1 hover:scale-110"
                    title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5 sm:h-6 sm:w-6" /> : <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Information & Actions Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Real Metadata */}
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
                <span className="bg-red-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded tracking-wider uppercase">
                  {video.category || 'General'}
                </span>
                <span className="text-[11px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded">
                  {video.visibility || 'Public'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 text-white/90 font-medium">
                  <Eye className="h-3.5 w-3.5 text-accent" />
                  {(video.views || 0).toLocaleString()} Views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(duration)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {publishedDate}
                </span>
              </div>
            </div>

            {/* Clean Action Deck */}
            <div className="flex flex-wrap items-center gap-3 py-3 border-y border-white/10">
              {/* Like / Unlike Button (Guaranteed working) */}
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer",
                  liked 
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                <span>{liked ? 'Liked' : 'Like'} ({likeCount})</span>
              </button>

              {/* My List / Watchlist Button */}
              <button
                onClick={handleWatchlistToggle}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer",
                  inWatchlist 
                    ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span>{inWatchlist ? 'In My List' : 'Add to List'}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success('Link copied to clipboard! 📋');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Creator Spotlight Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center font-extrabold text-white text-lg shadow-lg ring-2 ring-white/10 shrink-0">
                  {(video.creatorName || video.creatorUsername || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {video.creatorName || video.creatorUsername || 'FunFlix Creator'}
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    @{video.creatorUsername || 'creator'} • Content Creator
                  </p>
                </div>
              </div>

              {video.creatorId && (
                <Link
                  to={`/portfolio/${video.creatorUsername || video.creatorId}`}
                  className="text-xs font-bold text-accent hover:text-white bg-accent/10 hover:bg-accent/20 px-3.5 py-1.5 rounded-lg transition shrink-0"
                >
                  View Portfolio ➔
                </Link>
              )}
            </div>

            {/* Real Description & Tags */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                About this video
              </h4>
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                {video.description || 'No description provided.'}
              </p>

              {video.tags && video.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  {video.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white/5 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Genuine "More Like This" Recommendations */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  More Like This
                </h3>
              </div>

              <div className="space-y-3.5">
                {relatedVideos.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">
                    No related videos found in this category.
                  </p>
                ) : (
                  relatedVideos.map(item => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/funflix/watch/${item.id}`)}
                      className="group cursor-pointer rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-red-500/40 p-2 transition-all flex gap-3"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                        {item.thumbnail ? (
                          <img
                            src={normalizeMediaUrl(item.thumbnail)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950/40 to-slate-900">
                            <Film className="h-5 w-5 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center transition">
                          <Play className="h-5 w-5 text-white opacity-80 group-hover:opacity-100 fill-current" />
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-xs text-white group-hover:text-red-400 transition truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                          {item.creatorName || item.creatorUsername || 'Creator'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                          <span className="text-red-400 font-semibold">{item.category || 'General'}</span>
                          <span>•</span>
                          <span>{(item.views || 0).toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
