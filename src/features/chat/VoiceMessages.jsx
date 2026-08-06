import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Mic, Play, Pause, Trash2, RotateCcw, Gauge, Clock, Sparkles, Volume2, Send, X, Radio } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function VoiceMessages() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [waveformData, setWaveformData] = useState([]);
  const [recordings, setRecordings] = useState([
    { id: 1, duration: 15, waveform: [30, 50, 40, 60, 45, 55, 35, 70, 50, 40], createdAt: '2 hours ago' },
    { id: 2, duration: 23, waveform: [40, 60, 50, 70, 55, 65, 45, 80, 60, 50], createdAt: '5 hours ago' },
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        // Simulate waveform data during recording
        setWaveformData(prev => {
          const newData = [...prev, Math.random() * 80 + 20];
          return newData.slice(-50);
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setDuration(0);
      setWaveformData([]);
    }
  };

  const handleDelete = (id) => {
    setRecordings(recordings.filter(r => r.id !== id));
  };

  const handleSend = () => {
    if (duration > 0) {
      setRecordings([...recordings, {
        id: Date.now(),
        duration,
        waveform: waveformData.length > 0 ? waveformData : [30, 50, 40, 60, 45, 55, 35, 70, 50, 40],
        createdAt: 'Just now'
      }]);
      setDuration(0);
      setWaveformData([]);
    }
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <PageContainer>
      <PageHeader 
        title="Voice Messages" 
        description="Record, preview, and manage voice messages with advanced features."
        hero={true}
      />

      <Card className="mb-6 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-2xl shadow-xl shadow-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleRecord}
              className={`relative h-20 w-20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl ${
                isRecording 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/50' 
                  : 'bg-gradient-to-br from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 shadow-accent/50'
              }`}
            >
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
              )}
              <Mic className={`h-8 w-8 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isRecording && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Recording</span>
                  </div>
                )}
                <h3 className="font-bold text-white text-lg">
                  {isRecording ? 'Recording in progress...' : 'Tap to Record'}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">{formatTime(duration)}</span>
                </div>
                {duration > 0 && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-xs">{waveformData.length} samples</span>
                  </div>
                )}
              </div>
            </div>
            {duration > 0 && !isRecording && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setDuration(0); setWaveformData([]); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-sm font-bold">Re-record</span>
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-white border border-accent/40 hover:from-accent/90 hover:to-purple-600/90 hover:scale-105 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  <span className="text-sm font-bold">Send</span>
                </button>
              </div>
            )}
          </div>

          {duration > 0 && (
            <div className="mt-6">
              <div className="h-16 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/15 flex items-center gap-1 px-4 overflow-hidden backdrop-blur-xl">
                {Array.from({ length: 50 }).map((_, i) => {
                  const height = waveformData[i] || (isRecording ? Math.random() * 80 + 20 : 20);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-accent/60 to-purple-500/60 rounded-full transition-all duration-300"
                      style={{
                        height: `${height}%`,
                        opacity: isRecording ? 1 : 0.6,
                        boxShadow: isRecording ? '0 0 8px rgba(139, 92, 246, 0.5)' : 'none'
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-white/15 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-accent" />
            <CardTitle>Playback Controls</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-white/60" />
              <span className="text-white/60 text-sm font-medium">Playback Speed:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {speeds.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 border ${
                    playbackSpeed === speed
                      ? 'bg-gradient-to-r from-accent to-purple-600 text-white border-accent/40 shadow-lg shadow-accent/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/15 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-2xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-accent" />
            <CardTitle>Recordings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div key={recording.id} className="p-4 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/15 hover:border-accent/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-accent/10 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-purple-600 text-white border border-accent/40 hover:from-accent/90 hover:to-purple-600/90 hover:scale-110 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 active:scale-95 flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="h-10 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 flex items-center gap-1 px-3 overflow-hidden">
                      {recording.waveform.map((height, i) => (
                        <div
                          key={i}
                          className={`flex-1 bg-gradient-to-t from-accent/70 to-purple-500/70 rounded-full transition-all duration-300 ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{ 
                            height: `${height}%`,
                            boxShadow: isPlaying ? '0 0 6px rgba(139, 92, 246, 0.4)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-white/80 text-sm font-mono font-bold">{formatTime(recording.duration)}</p>
                    <p className="text-white/40 text-xs">{recording.createdAt}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:scale-110 transition-all duration-200 active:scale-95 flex items-center justify-center"
                    aria-label="Delete recording"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
