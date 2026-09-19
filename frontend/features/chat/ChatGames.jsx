import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Gamepad2, Trophy, Zap, MessageSquare, Target, Brain, Users, Clock, Play, Crosshair } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { ChatGamesModal } from './ChatGamesModal';

export default function ChatGames() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  const games = [
    { id: 'arena', name: 'Blaster Arena', icon: Crosshair, color: 'rose', description: '2-7 player tactical 2D battle with HP, shields, movement, and blaster shots', players: '2-7 Players', duration: '8 min', xp: 300 },
    { id: 'ttt', name: 'Tic-Tac-Toe Duel', icon: Target, color: 'cyan', description: 'Classic real-time 2-player strategy duel', players: '2 Players', duration: '2 min', xp: 75 },
    { id: 'c4', name: 'Connect Four Arena', icon: Target, color: 'blue', description: 'Bigger 4-in-a-row strategy battle with live board control', players: '2 Players', duration: '3 min', xp: 100 },
    { id: 'rps', name: 'Rock Paper Scissors', icon: Gamepad2, color: 'purple', description: 'Best-of-5 hidden-choice showdown with round history', players: '2 Players', duration: '2 min', xp: 80 },
    { id: 'trivia', name: 'Trivia Duel', icon: Brain, color: 'emerald', description: 'Randomized 5-question knowledge duel with final scoring', players: '2 Players', duration: '4 min', xp: 150 },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-violet-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/50',
      rose: 'bg-gradient-to-br from-rose-500/25 via-fuchsia-500/15 to-cyan-500/10 border-rose-500/40 text-rose-300 shadow-rose-500/50',
      cyan: 'bg-gradient-to-br from-cyan-500/25 via-cyan-500/15 to-sky-500/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/50',
      emerald: 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-green-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/50',
      blue: 'bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-sky-500/10 border-blue-500/40 text-blue-400 shadow-blue-500/50',
    };
    return colors[color] || colors.purple;
  };

  const handlePlayNow = (gameId) => {
    setSelectedGameId(gameId);
    setIsModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Chat Multiplayer Games" 
        description="Challenge friends and colleagues to real-time multiplayer duels right from chat."
        hero={true}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Trophy className="h-4 w-4 text-accent" />
          <span>Earn XP & rank up on the chat leaderboard with every victory!</span>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/chat')}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Open Chat Rooms
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Card 
              key={game.id} 
              className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group flex flex-col justify-between"
            >
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div>
                  <div className={`relative p-4 rounded-2xl ${getColorClass(game.color)} mb-5 shadow-lg inline-block`}>
                    <Icon className="h-8 w-8" />
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent animate-ping opacity-50" />
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent shadow-lg shadow-accent/50" />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg group-hover:text-accent transition-colors">{game.name}</h3>
                  <p className="text-white/60 text-sm mb-5 leading-relaxed">{game.description}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5 text-xs">
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
                    onClick={() => handlePlayNow(game.id)}
                    className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-102"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Duel Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <ChatGamesModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGameId(null);
          }}
          currentUser={user}
          activeRoomId="general"
          initialGameId={selectedGameId}
          onSendGameCard={() => {
            navigate('/chat');
          }}
        />
      )}
    </PageContainer>
  );
}
