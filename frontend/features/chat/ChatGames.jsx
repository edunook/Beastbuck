import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Gamepad2, Trophy, Zap, MessageSquare, Target, Brain, Users, Clock, Play, Crosshair } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { ChatGamesModal } from './ChatGamesModal';
import { BATTLE_GAME_ID } from './games/beastbuck-battle/constants';

export default function ChatGames() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  const games = [
    { id: BATTLE_GAME_ID, name: 'BeastBuck Battle Arena', icon: Crosshair, color: 'rose', description: 'Real-time 2D arena combat with jet movement, live projectiles, respawns, and pickups.', players: '2-7 Players', duration: '3 min', xp: 300 },
    { id: 'ttt', name: 'Tic-Tac-Toe Duel', icon: Target, color: 'cyan', description: 'Classic real-time 2-player strategy duel', players: '2 Players', duration: '2 min', xp: 75 },
    { id: 'c4', name: 'Connect Four Arena', icon: Target, color: 'blue', description: 'Bigger 4-in-a-row strategy battle with live board control', players: '2 Players', duration: '3 min', xp: 100 },
    { id: 'rps', name: 'Rock Paper Scissors', icon: Gamepad2, color: 'purple', description: 'Best-of-5 hidden-choice showdown with round history', players: '2 Players', duration: '2 min', xp: 80 },
    { id: 'trivia', name: 'Trivia Duel', icon: Brain, color: 'emerald', description: 'Randomized 5-question knowledge duel with final scoring', players: '2 Players', duration: '4 min', xp: 150 },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-gradient-to-br from-amber-100 via-amber-50 to-white border-amber-200 text-amber-700 shadow-amber-200/50',
      rose: 'bg-gradient-to-br from-rose-100 via-orange-50 to-white border-rose-200 text-rose-700 shadow-rose-200/50',
      cyan: 'bg-gradient-to-br from-cyan-100 via-sky-50 to-white border-cyan-200 text-cyan-700 shadow-cyan-200/50',
      emerald: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-white border-emerald-200 text-emerald-700 shadow-emerald-200/50',
      blue: 'bg-gradient-to-br from-sky-100 via-blue-50 to-white border-sky-200 text-sky-700 shadow-sky-200/50',
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
        <div className="flex items-center gap-2 text-[#39728d] text-sm">
          <Trophy className="h-4 w-4 text-accent" />
          <span>Earn XP & rank up on the chat leaderboard with every victory!</span>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/chat')}
          className="bg-white hover:bg-sky-50 text-[#164661] border-sky-200 text-sm"
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
              className="border-sky-200 bg-white hover:border-cyan-300 hover:shadow-2xl hover:shadow-sky-200/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group flex flex-col justify-between"
            >
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div>
                  <div className={`relative p-4 rounded-2xl ${getColorClass(game.color)} mb-5 shadow-lg inline-block`}>
                    <Icon className="h-8 w-8" />
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent animate-ping opacity-50" />
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent shadow-lg shadow-accent/50" />
                  </div>
                  <h3 className="font-bold text-[#164661] mb-2 text-lg group-hover:text-cyan-700 transition-colors">{game.name}</h3>
                  <p className="text-[#4b7d94] text-sm mb-5 leading-relaxed">{game.description}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#7299aa]">
                      <Users className="h-3.5 w-3.5" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7299aa]">
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
                    className="w-full bg-cyan-500 hover:bg-cyan-600 border border-cyan-400 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-102"
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
        />
      )}
    </PageContainer>
  );
}
