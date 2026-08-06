import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Zap, Send, Lightbulb, BookOpen, FlaskConical, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../../auth/AuthContext';

export function AICompanionWidget() {
  const { user, roleData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    '🤖 Build an AI',
    '💡 Get Ideas',
    '📖 Explain a Topic',
    '🧪 Start Research',
    '🎨 Generate Creativity',
    '🎬 Write a Story',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.substring(2));
  };

  const handleSend = async () => {
    if (!message.trim() || !user?.uid) return;
    
    const userMessage = { id: Date.now(), text: message, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    
    try {
      const { AIService } = await import('../../../services/firebase/ai');
      const response = await AIService.sendMessage({
        message,
        context: 'dashboard',
        userId: user.uid,
      });
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: response.text || 'I can help you with that! Check out AI Studio to build something amazing.', 
        sender: 'ai' 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'I\'m here to help! Visit AI Studio to explore more.', 
        sender: 'ai' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-accent to-purple-500 shadow-2xl shadow-accent/30 hover:scale-110 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Sparkles className="h-7 w-7 text-background animate-pulse" />
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-status-success animate-ping" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 max-h-[calc(100vh-120px)]">
          <Card className="relative h-full flex flex-col border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                <div className="relative h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                AI Companion
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs text-text-muted mb-3">What would you like to explore today?</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-accent hover:bg-accent/10 transition-all duration-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-accent to-purple-500 text-background'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}>
                      <p className="text-sm font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 border-t border-white/10">
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-all duration-300 resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className="flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out both; }
      `}</style>
    </>
  );
}