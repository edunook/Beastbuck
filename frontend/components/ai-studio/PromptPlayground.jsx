import { useState } from 'react';
import { Bot, Send, RefreshCw, Copy, Check, Play, Settings } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';

export function PromptPlayground({ aiConfig }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your request, here's what I found...",
        "That's a great question! Let me help you with that.",
        "I've analyzed your input and here are my recommendations.",
        "Here's a detailed response to your query.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
  };

  const copyConversation = () => {
    const text = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex items-center justify-between border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            Prompt Playground
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={copyConversation}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {showSettings && (
          <div className="p-4 border-b border-border bg-white/[0.03] space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Temperature</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Max Tokens</label>
              <Input type="number" defaultValue="1000" className="h-8" />
            </div>
          </div>
        )}

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-accent text-black'
                    : 'bg-white/[0.03] border border-border text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-border p-3 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
