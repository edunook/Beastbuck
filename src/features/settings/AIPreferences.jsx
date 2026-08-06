import { useState } from 'react';
import { Bot, MessageSquare, Zap, Globe, Brain } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIPreferences() {

  const [aiProvider, setAIProvider] = useState('openai');
  const [aiModel, setAIModel] = useState('gpt-4');
  const [conversationStyle, setConversationStyle] = useState('professional');
  const [responseLength, setResponseLength] = useState('medium');
  const [creativeLevel, setCreativeLevel] = useState('balanced');
  const [language, setLanguage] = useState('english');

  return (
    <PageContainer>
      <PageHeader 
        title="AI Preferences" 
        description="AI configuration including default AI provider, default AI model, preferred conversation style, response length, creative level, language, and AI memory (future)."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              AI Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <select
              value={aiProvider}
              onChange={(e) => setAIProvider(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google AI</option>
              <option value="cohere">Cohere</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              AI Model
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <select
              value={aiModel}
              onChange={(e) => setAIModel(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini">Gemini Pro</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Conversation Style
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {['Professional', 'Casual', 'Technical'].map((style) => (
                <button
                  key={style}
                  onClick={() => setConversationStyle(style.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all ${conversationStyle === style.toLowerCase() ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Response Length
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {['Short', 'Medium', 'Long'].map((length) => (
                <button
                  key={length}
                  onClick={() => setResponseLength(length.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all ${responseLength === length.toLowerCase() ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  {length}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              Creative Level
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {['Conservative', 'Balanced', 'Creative'].map((level) => (
                <button
                  key={level}
                  onClick={() => setCreativeLevel(level.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all ${creativeLevel === level.toLowerCase() ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
            </select>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Memory (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-text-muted">
            Enable AI to remember your preferences, past conversations, and context for more personalized responses.
          </p>
          <Button variant="secondary" disabled className="mt-4">
            Enable AI Memory
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
        Save Changes
      </Button>
    </PageContainer>
  );
}
