import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, RefreshCw, Copy, Check, MessageSquare, Settings, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function PromptPlayground({ aiConfig, onSaveConfig }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testMode, setTestMode] = useState('chat'); // chat, welcome, questions
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send welcome message when AI config changes
    if (aiConfig?.welcomeMessage && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            role: 'assistant',
            content: aiConfig.welcomeMessage,
            timestamp: new Date(),
          }
        ]);
      }, 500);
    }
  }, [aiConfig]);

  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      let response = '';
      
      if (aiConfig?.personality === 'Professional') {
        response = `Based on my ${aiConfig.focusAreas?.join(' and ') || 'expertise'}, I would approach this by considering the key factors involved. Let me provide a structured analysis of your query: "${userMessage}".`;
      } else if (aiConfig?.personality === 'Friendly') {
        response = `Hey there! Great question! 😊 Let me help you with "${userMessage}". I'm here to make this easy to understand!`;
      } else if (aiConfig?.personality === 'Funny') {
        response = `Ah, the classic "${userMessage}" question! Let me break this down before my circuits overheat from excitement! 🤖`;
      } else if (aiConfig?.personality === 'Teacher') {
        response = `Excellent question about "${userMessage}"! Let me explain this step by step so you really understand the concept.`;
      } else {
        response = `I understand you're asking about "${userMessage}". Based on my configuration as a ${aiConfig?.personality || 'helpful'} assistant with expertise in ${aiConfig?.focusAreas?.join(', ') || 'various topics'}, here's my response.`;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
      ]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    simulateAIResponse(input);
  };

  const handleTestWelcome = () => {
    setMessages([
      {
        role: 'assistant',
        content: aiConfig?.welcomeMessage || 'Hello! I am your AI assistant.',
        timestamp: new Date(),
      }
    ]);
  };

  const handleTestQuestions = () => {
    if (aiConfig?.starterQuestions && aiConfig.starterQuestions.length > 0) {
      const questions = aiConfig.starterQuestions.filter(q => q.trim());
      setMessages([
        {
          role: 'assistant',
          content: `Here are my starter questions:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
          timestamp: new Date(),
        }
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: 'No starter questions configured yet.',
          timestamp: new Date(),
        }
      ]);
    }
  };

  const handleReset = () => {
    setMessages([]);
    if (aiConfig?.welcomeMessage) {
      setTimeout(() => {
        setMessages([
          {
            role: 'assistant',
            content: aiConfig.welcomeMessage,
            timestamp: new Date(),
          }
        ]);
      }, 300);
    }
  };

  const copyConversation = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : aiConfig?.name || 'AI'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportConfig = () => {
    if (onSaveConfig) {
      onSaveConfig(aiConfig);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Prompt Playground
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" variant="secondary" onClick={copyConversation}>
              {copied ? <><Check className="h-4 w-4 mr-1" />Copied</> : <><Copy className="h-4 w-4 mr-1" />Copy</>}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Test Mode Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={testMode === 'chat' ? 'primary' : 'secondary'}
            onClick={() => setTestMode('chat')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            size="sm"
            variant={testMode === 'welcome' ? 'primary' : 'secondary'}
            onClick={() => { setTestMode('welcome'); handleTestWelcome(); }}
          >
            <Play className="h-4 w-4 mr-1" />
            Welcome
          </Button>
          <Button
            size="sm"
            variant={testMode === 'questions' ? 'primary' : 'secondary'}
            onClick={() => { setTestMode('questions'); handleTestQuestions(); }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Questions
          </Button>
        </div>

        {/* AI Configuration Preview */}
        {aiConfig && (
          <div className="bg-white/5 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{aiConfig.emoji || '🤖'}</span>
              <div className="flex-1">
                <p className="font-bold text-white">{aiConfig.name || 'Untitled AI'}</p>
                <p className="text-xs text-text-muted">
                  {aiConfig.personality} · {aiConfig.tone} · {aiConfig.focusAreas?.join(', ') || 'No focus areas'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar bg-black/20 rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-12 w-12 text-text-muted mb-3" />
              <p className="text-text-muted">Start a conversation to test your AI</p>
              {aiConfig?.starterQuestions && aiConfig.starterQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-text-muted mb-2">Try one of these starter questions:</p>
                  {aiConfig.starterQuestions.filter(q => q.trim()).slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left text-sm bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-accent transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-accent text-black'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{aiConfig?.emoji || '🤖'}</span>
                      <span className="text-xs font-bold text-accent">{aiConfig?.name || 'AI'}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message to test your AI..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Export Button */}
        {onSaveConfig && (
          <Button onClick={exportConfig} className="w-full mt-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Save & Publish AI
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
