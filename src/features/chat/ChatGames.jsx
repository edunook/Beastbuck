import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Gamepad2, Trophy, Zap, MessageSquare, HelpCircle, Target, Flame, Brain, Sparkles, Users, Clock, Star } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ChatGames() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { id: 'rps', name: 'Rock Paper Scissors', icon: Gamepad2, color: 'purple', description: 'Classic hand game', players: '2', duration: '2 min', xp: 50 },
    { id: 'ttt', name: 'Tic Tac Toe', icon: Target, color: 'cyan', description: 'Strategic grid game', players: '2', duration: '3 min', xp: 75 },
    { id: 'emoji', name: 'Guess the Emoji', icon: MessageSquare, color: 'amber', description: 'Guess the emoji meaning', players: '2-4', duration: '5 min', xp: 100 },
    { id: 'quiz', name: 'Quiz Battles', icon: HelpCircle, color: 'emerald', description: 'Knowledge competition', players: '2-6', duration: '10 min', xp: 200 },
    { id: 'wyr', name: 'Would You Rather', icon: MessageSquare, color: 'pink', description: 'Choice dilemmas', players: '2-8', duration: '5 min', xp: 80 },
    { id: 'rapid', name: 'Rapid Fire', icon: Flame, color: 'red', description: 'Fast-paced questions', players: '2-4', duration: '3 min', xp: 120 },
    { id: 'trivia', name: 'Trivia', icon: Brain, color: 'blue', description: 'Test your knowledge', players: '2-10', duration: '15 min', xp: 300 },
    { id: 'word', name: 'Word Chain', icon: MessageSquare, color: 'violet', description: 'Word building game', players: '2-6', duration: '8 min', xp: 150 },
    { id: 'puzzle', name: 'Daily Puzzle', icon: Target, color: 'orange', description: 'Daily brain teaser', players: '1', duration: '10 min', xp: 250 },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-violet-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/50',
      cyan: 'bg-gradient-to-br from-cyan-500/25 via-cyan-500/15 to-sky-500/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/50',
      amber: 'bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-yellow-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/50',
      emerald: 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-green-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/50',
      pink: 'bg-gradient-to-br from-pink-500/25 via-pink-500/15 to-rose-500/10 border-pink-500/40 text-pink-400 shadow-pink-500/50',
      red: 'bg-gradient-to-br from-red-500/25 via-red-500/15 to-rose-500/10 border-red-500/40 text-red-400 shadow-red-500/50',
      blue: 'bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-sky-500/10 border-blue-500/40 text-blue-400 shadow-blue-500/50',
      violet: 'bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-purple-500/10 border-violet-500/40 text-violet-400 shadow-violet-500/50',
      orange: 'bg-gradient-to-br from-orange-500/25 via-orange-500/15 to-amber-500/10 border-orange-500/40 text-orange-400 shadow-orange-500/50',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Chat Games" 
        description="Play mini games inside chat with friends and colleagues."
        hero={true}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Card 
              key={game.id} 
              className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className={`relative p-4 rounded-2xl ${getColorClass(game.color)} mb-5 shadow-lg`}>
                  <Icon className="h-8 w-8" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-ping opacity-50" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/50" />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg group-hover:text-accent transition-colors">{game.name}</h3>
                <p className="text-white/60 text-sm mb-5">{game.description}</p>
                
                <div className="flex items-center gap-4 mb-5 text-xs">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Users className="h-3.5 w-3.5" />
                    <span>{game.players}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{game.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent font-bold">
                    <Zap className="h-3.5 w-3.5" />
                    <span>+{game.xp} XP</span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedGame(game)}
                  className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Play Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedGame && (
        <Card className="mt-6 border-accent/40 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-2xl shadow-2xl shadow-accent/20">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${getColorClass(selectedGame.color)}`}>
                {(() => {
                  const Icon = selectedGame.icon;
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {selectedGame.name}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30">
                    <Star className="h-3 w-3 text-accent" />
                    <span className="text-[10px] font-bold text-accent">+{selectedGame.xp} XP</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">{selectedGame.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="text-8xl">🎮</div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent animate-ping opacity-50" />
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent shadow-lg shadow-accent/50" />
              </div>
              <h3 className="font-bold text-white text-2xl mb-3">Game Starting...</h3>
              <p className="text-white/60 mb-8">Invite a friend to play {selectedGame.name}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setSelectedGame(null)} 
                  variant="secondary"
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/15 hover:bg-white/15 hover:border-white/25"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-105"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Player
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
