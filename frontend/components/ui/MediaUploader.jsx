import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  FileText,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  WifiOff,
  Zap,
} from 'lucide-react';
import { B2Uploader } from '@services/storage/b2Uploader';
import { cn } from '@shared/lib/utils';

export function MediaUploader({
  accept = 'image/*,video/*',
  maxSizeGB = 50,
  folder = 'uploads',
  visibility = 'public',
  onUploadSuccess = () => {},
  onUploadError = () => {},
  className,
  label = 'Upload Media',
  description = 'Images or videos up to 50 GB',
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploader, setUploader] = useState(null);
  const [progress, setProgress] = useState({
    percent: 0,
    transferredBytes: 0,
    fileSize: 0,
    speedMBps: 0,
    remainingSeconds: null,
    completedChunks: 0,
    totalChunks: 1,
    isMultipart: false,
    activeChunk: null,
    isRetrying: false,
    retryAttempt: 0,
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'paused' | 'verifying' | 'completed' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const uploaderRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSeconds = (sec) => {
    if (sec === null || sec === undefined || isNaN(sec)) return '--';
    if (sec < 60) return `~${sec}s remaining`;
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    if (min < 60) return `~${min}m ${s}s remaining`;
    const hrs = Math.floor(min / 60);
    const m = min % 60;
    return `~${hrs}h ${m}m remaining`;
  };

  const startUpload = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    const maxBytes = maxSizeGB * 1024 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setErrorMessage(`File size exceeds maximum limit of ${maxSizeGB} GB`);
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setStatus('uploading');

    const newUploader = new B2Uploader(selectedFile, {
      folder,
      visibility,
      onProgress: (p) => {
        setProgress(p);
      },
      onStatusChange: (newStatus, detail) => {
        setStatus(newStatus);
        if (newStatus === 'completed' && detail) {
          onUploadSuccess(detail);
        } else if (newStatus === 'error') {
          setErrorMessage(detail?.message || 'Upload failed');
          onUploadError(detail);
        }
      },
    });

    uploaderRef.current = newUploader;
    setUploader(newUploader);

    try {
      await newUploader.start();
    } catch (err) {
      if (newUploader.isPaused || newUploader.isAborted) return;
      setErrorMessage(err.message || 'Upload failed');
      setStatus('error');
    }
  }, [folder, visibility, maxSizeGB, onUploadSuccess, onUploadError]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      startUpload(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      startUpload(dropped);
    }
  };

  const handlePause = () => {
    if (uploaderRef.current) {
      uploaderRef.current.pause();
      setStatus('paused');
    }
  };

  const handleResume = () => {
    if (uploaderRef.current) {
      setStatus('uploading');
      uploaderRef.current.resume().catch((err) => {
        setErrorMessage(err.message);
        setStatus('error');
      });
    }
  };

  const handleCancel = () => {
    if (uploaderRef.current) {
      uploaderRef.current.abort();
    }
    setFile(null);
    setUploader(null);
    setStatus('idle');
    setProgress({
      percent: 0,
      transferredBytes: 0,
      fileSize: 0,
      speedMBps: 0,
      remainingSeconds: null,
      completedChunks: 0,
      totalChunks: 1,
      isMultipart: false,
    });
  };

  const isVideo = file?.type?.startsWith('video/');
  const isImage = file?.type?.startsWith('image/');

  return (
    <div className={cn('w-full space-y-4', className)}>
      {status === 'idle' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('b2-file-input')?.click()}
          className={cn(
            'group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300',
            isDragging
              ? 'border-accent bg-accent/10 scale-[1.01]'
              : 'border-white/10 hover:border-accent/50 hover:bg-white/[0.02]'
          )}
        >
          <input
            id="b2-file-input"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/30 group-hover:scale-110 transition-all duration-300">
            <UploadCloud className="h-7 w-7 text-text-muted group-hover:text-accent transition-colors" />
          </div>
          <p className="text-base font-bold text-white mb-1 group-hover:text-accent transition-colors">
            {isDragging ? 'Drop file to upload directly' : label}
          </p>
          <p className="text-xs text-text-muted">{description}</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-text-muted/70">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent" /> Direct High-Speed Storage
            </span>
            <span>•</span>
            <span>Resumable Multipart</span>
            <span>•</span>
            <span>Cloudflare Edge Delivery</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md shadow-2xl space-y-4">
          {/* File Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent">
                {isVideo ? <Film className="h-5 w-5" /> : isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{file?.name}</p>
                <p className="text-xs text-text-muted">
                  {formatBytes(file?.size)} • {progress.isMultipart ? `${progress.totalChunks} chunks` : 'Single part'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status === 'uploading' && (
                <button
                  type="button"
                  onClick={handlePause}
                  className="rounded-lg p-2 text-text-muted hover:text-white hover:bg-white/10 transition"
                  title="Pause Upload"
                >
                  <Pause className="h-4 w-4" />
                </button>
              )}
              {status === 'paused' && (
                <button
                  type="button"
                  onClick={handleResume}
                  className="rounded-lg p-2 text-accent hover:text-accent/80 hover:bg-accent/10 transition"
                  title="Resume Upload"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              {status !== 'completed' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Cancel Upload"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">
                {status === 'verifying'
                  ? 'Verifying integrity with storage...'
                  : status === 'completed'
                  ? 'Upload verified ✓'
                  : status === 'paused'
                  ? 'Paused'
                  : `${progress.percent}% uploaded`}
              </span>
              <span className="text-text-muted">
                {formatBytes(progress.transferredBytes)} / {formatBytes(file?.size)}
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  status === 'completed'
                    ? 'bg-status-success'
                    : status === 'paused'
                    ? 'bg-status-warning'
                    : status === 'error'
                    ? 'bg-status-danger'
                    : 'bg-gradient-to-r from-accent to-accent-alt'
                )}
                style={{ width: `${status === 'completed' ? 100 : progress.percent}%` }}
              />
            </div>
          </div>

          {/* Real-time Telemetry Banner */}
          {status === 'uploading' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted bg-black/30 rounded-xl px-3 py-2 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                <span className="text-white font-medium">{progress.speedMBps} MB/s</span>
                <span>•</span>
                <span>{formatSeconds(progress.remainingSeconds)}</span>
              </div>

              {progress.isMultipart && (
                <div className="flex items-center gap-2 text-[11px]">
                  {progress.isRetrying ? (
                    <span className="text-status-warning font-bold flex items-center gap-1">
                      <RotateCcw className="h-3 w-3 animate-spin" /> Part {progress.activeChunk} retrying (attempt {progress.retryAttempt})...
                    </span>
                  ) : (
                    <span>
                      Part {progress.completedChunks + 1} of {progress.totalChunks}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Network Offline Warning */}
          {isOffline && status === 'uploading' && (
            <div className="flex items-center gap-2 rounded-xl bg-status-warning/10 border border-status-warning/30 px-3 py-2 text-xs text-status-warning">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>Network interrupted — preserving upload session. Will resume automatically when connected.</span>
            </div>
          )}

          {/* Verification Badge */}
          {status === 'verifying' && (
            <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-accent">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Assembling parts and verifying checksums...</span>
            </div>
          )}

          {/* Completion Badge */}
          {status === 'completed' && (
            <div className="flex items-center justify-between rounded-xl bg-status-success/10 border border-status-success/30 px-3.5 py-2.5 text-xs text-status-success">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Upload verified and delivered via CDN ✓</span>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-white/80 hover:text-white underline font-semibold text-[11px]"
              >
                Upload another
              </button>
            </div>
          )}

          {/* Error Banner */}
          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-status-danger/10 border border-status-danger/30 px-3 py-2 text-xs text-status-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{errorMessage || 'Upload failed.'}</span>
              </div>
              <button
                type="button"
                onClick={() => startUpload(file)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 py-2 text-xs font-bold text-white transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry Upload
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
