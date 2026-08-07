import { useState, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Send, Smile, Image as ImageIcon, Paperclip, Mic, Camera, Code, AtSign, Calendar, Clock, Sparkles } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function RichMessageComposer() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '🥳', '🎉', '🔥', '💯', '❤️', '👍', '👏', '🚀', '💡', '🎯', '⭐', '🌟'];
  const stickers = ['🎨', '🎬', '🎮', '🎵', '🎸', '🎭', '🎪', '🎢', '🎡', '🎠', '🎯', '🎲'];

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
    setIsDraft(false);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Rich Message Composer" 
        description="Enhanced messaging with rich text, media, and smart features."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4 mr-2" />
                Emoji
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowGifPicker(!showGifPicker)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                GIF
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowStickerPicker(!showStickerPicker)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Sticker
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleFileUpload}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                File
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleVoiceRecord}
                className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? 'Recording...' : 'Voice'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                size="sm"
                variant="secondary"
              >
                <Code className="h-4 w-4 mr-2" />
                Code
              </Button>
              <Button
                size="sm"
                variant="secondary"
              >
                <AtSign className="h-4 w-4 mr-2" />
                Mention
              </Button>
              <Button
                size="sm"
                variant="secondary"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>

            {showEmojiPicker && (
              <div className="p-4 rounded-xl bg-white/5 border border-border">
                <div className="flex gap-2 flex-wrap">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setMessage(prev => prev + emoji)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showStickerPicker && (
              <div className="p-4 rounded-xl bg-white/5 border border-border">
                <div className="flex gap-2 flex-wrap">
                  {stickers.map((sticker) => (
                    <button
                      key={sticker}
                      onClick={() => setMessage(prev => prev + sticker)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsDraft(e.target.value.length > 0);
                }}
                placeholder="Type a message... (Markdown supported)"
                className="min-h-[120px] py-3"
                multiline
              />
              {isDraft && (
                <div className="absolute top-2 right-2 text-xs text-text-muted">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Draft saved
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-text-muted">
                {isDraft && 'Draft • '}
                Markdown supported • Drag & drop files
              </div>
              <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Rich Text</h3>
            <p className="text-text-muted text-sm">Bold, italic, underline, strikethrough formatting</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Markdown</h3>
            <p className="text-text-muted text-sm">Full markdown support for structured messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Code Snippets</h3>
            <p className="text-text-muted text-sm">Syntax-highlighted code blocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Mentions</h3>
            <p className="text-text-muted text-sm">@mention members, teams, departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Slash Commands</h3>
            <p className="text-text-muted text-sm">Quick actions with /commands</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-white mb-2">Message Scheduling</h3>
            <p className="text-text-muted text-sm">Schedule messages for later delivery</p>
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
      />
    </PageContainer>
  );
}
