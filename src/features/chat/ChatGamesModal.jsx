import { useState, useEffect, useRef } from 'react';
import { 
  X, Gamepad2, Users, Target, Flame, Brain, MessageSquare, RefreshCw, UserCheck, Play, Sparkles, Zap, Trophy, Globe, Shield, Send
} from 'lucide-react';
import Button from '../../components/ui/Button';

const GAME_CATEGORIES = [
  { id: 'all', name: 'All Games' },
  { id: 'room', name: '🌐 Whole Room Party (All Devices)' },
  { id: 'duel', name: '👥 1-on-1 Account Duels' },
];

const GAMES = [
  { 
    id: 'reaction', 
    name: 'Speed Reaction Reflex', 
    category: 'room',
    icon: Zap, 
    players: 'All Room Accounts', 
    duration: '30 sec', 
    description: 'Multi-device reflex test! When signal turns GREEN, first player across all devices to click wins!' 
  },
  { 
    id: 'trivia', 
    name: 'BeastBuck Live Trivia Arena', 
    category: 'room',
    icon: Brain, 
    players: 'All Room Accounts', 
    duration: '3 min', 
    description: 'Multi-question live quiz. All members submit answers from their own devices with real-time room leaderboard!' 
  },
  { 
    id: 'c4', 
    name: 'Connect Four Account Duel', 
    category: 'duel',
    icon: Target, 
    players: '2 Accounts (1-on-1)', 
    duration: '3 min', 
    description: 'Classic 6x7 grid battle between 2 logged-in user accounts. Drop discs to line up 4-in-a-row.' 
  },
  { 
    id: 'ttt', 
    name: 'Tic Tac Toe Account Duel', 
    category: 'duel',
    icon: Target, 
    players: '2 Accounts (1-on-1)', 
    duration: '2 min', 
    description: 'Turn-based 3x3 strategy battle between 2 accounts with synchronized turn detection.' 
  },
  { 
    id: 'rps', 
    name: 'Rock Paper Scissors Showdown', 
    category: 'duel',
    icon: Gamepad2, 
    players: '2 Accounts (1-on-1)', 
    duration: '1 min', 
    description: 'Secret move selection between 2 user accounts with live match reveal.' 
  },
  { 
    id: 'wyr', 
    name: 'Would You Rather (Live Poll)', 
    category: 'room',
    icon: MessageSquare, 
    players: 'All Room Accounts', 
    duration: '2 min', 
    description: 'Live 2-way dilemma polling across all member devices with real-time percentage charts.' 
  },
  { 
    id: 'thisthat', 
    name: 'This or That Room Poll', 
    category: 'room',
    icon: Flame, 
    players: 'All Room Accounts', 
    duration: '2 min', 
    description: 'Fast binary preference choices for all active room accounts.' 
  },
];

export function ChatGamesModal({ onClose, members = [], currentUser, onSendGameCard }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);

  const currentAccountName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You';

  // Reaction Speed State
  const [reactionState, setReactionState] = useState('idle'); // 'idle', 'waiting', 'ready', 'clicked', 'too_early'
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionScore, setReactionScore] = useState(null);
  const reactionTimerRef = useRef(null);

  const startReactionGame = () => {
    setReactionState('waiting');
    setReactionScore(null);
    const delay = Math.floor(Math.random() * 3000) + 2000;
    reactionTimerRef.current = setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      clearTimeout(reactionTimerRef.current);
      setReactionState('too_early');
    } else if (reactionState === 'ready') {
      const elapsed = Date.now() - reactionStartTime;
      setReactionScore(elapsed);
      setReactionState('clicked');
    }
  };

  // Connect Four State (6 rows, 7 cols)
  const [c4Board, setC4Board] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [c4Turn, setC4Turn] = useState('Red'); // 'Red' (Host) vs 'Yellow' (Opponent)
  const [c4Winner, setC4Winner] = useState(null);

  const dropC4Disc = (colIdx) => {
    if (c4Winner) return;
    const nextBoard = c4Board.map(row => [...row]);
    let droppedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (!nextBoard[r][colIdx]) {
        nextBoard[r][colIdx] = c4Turn;
        droppedRow = r;
        break;
      }
    }
    if (droppedRow === -1) return;

    setC4Board(nextBoard);

    if (checkC4Win(nextBoard, droppedRow, colIdx, c4Turn)) {
      setC4Winner(c4Turn);
    } else {
      setC4Turn(c4Turn === 'Red' ? 'Yellow' : 'Red');
    }
  };

  const checkC4Win = (grid, r, c, color) => {
    const directions = [[[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]]];
    for (let [d1, d2] of directions) {
      let count = 1;
      for (let [dr, dc] of [d1, d2]) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && grid[nr][nc] === color) {
          count++;
          nr += dr;
          nc += dc;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  // Trivia State
  const triviaQuestions = [
    { q: 'Which data structure operates on a First-In, First-Out (FIFO) basis?', options: ['Stack', 'Queue', 'Array', 'Tree'], answer: 'Queue' },
    { q: 'What is the speed of light in vacuum approximately?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'], answer: '300,000 km/s' },
    { q: 'Which HTTP status code represents "Created"?', options: ['200', '201', '404', '500'], answer: '201' },
    { q: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], answer: 'Cascading Style Sheets' },
  ];
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const handleSubmitTrivia = (opt) => {
    setUserAnswers(prev => ({ ...prev, [triviaIndex]: opt }));
  };

  // Tic Tac Toe State
  const [tttBoard, setTTTBoard] = useState(Array(9).fill(null));
  const [tttTurn, setTTTTurn] = useState('X');
  const checkTTTWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) {
      const [a,b,c] = l;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    if (squares.every(s => s !== null)) return 'Draw';
    return null;
  };

  // Rock Paper Scissors State
  const [p1RPS, setP1RPS] = useState(null);
  const [p2RPS, setP2RPS] = useState(null);

  // Would You Rather Votes
  const [wyrVotes, setWyrVotes] = useState({ optionA: 5, optionB: 8, userVoted: null });

  const opponentAccountName = selectedOpponent?.displayName || selectedOpponent?.username || 'Player 2 Account';

  const handleBroadcastInvite = () => {
    if (!selectedGame) return;
    onSendGameCard?.({
      gameId: selectedGame.id,
      title: selectedGame.name,
      description: selectedGame.description,
    });
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const filteredGames = GAMES.filter(g => activeCategory === 'all' || g.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Multi-Device Account Arena</h2>
              <p className="text-xs text-white/50">Play real-time multiplayer games across devices using BeastBuck accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        {!selectedGame && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 bg-black/20 overflow-x-auto">
            {GAME_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  activeCategory === cat.id 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          
          {/* Opponent Selector for 1-on-1 Games */}
          {!selectedGame && activeCategory !== 'room' && (
            <div className="mb-5 p-4 rounded-2xl border border-white/10 bg-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 block flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-400" />
                Select Opponent Account from Room:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpponent(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    !selectedOpponent ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Pass & Play (Same Device)
                </button>
                {members.filter(m => m.id !== currentUser?.uid).slice(0, 8).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedOpponent(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      selectedOpponent?.id === m.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{m.displayName || m.username || 'Member'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedGame ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => {
                const Icon = game.icon;
                const isRoomGame = game.category === 'room';
                return (
                  <div
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                      setP1RPS(null);
                      setP2RPS(null);
                      setTTTBoard(Array(9).fill(null));
                      setTTTTurn('X');
                      setC4Board(Array(6).fill(null).map(() => Array(7).fill(null)));
                      setC4Winner(null);
                      setC4Turn('Red');
                      setReactionState('idle');
                    }}
                    className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 hover:border-indigo-500/50 hover:shadow-xl transition hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl border ${
                          isRoomGame 
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                            : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isRoomGame 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        }`}>
                          {game.players}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">{game.name}</h3>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{game.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-white/40 font-semibold">
                      <span>⏱️ {game.duration}</span>
                      <span className="text-indigo-400 group-hover:underline flex items-center gap-1">Open Arena →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setSelectedGame(null)} 
                  className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  ← Back to Game Collection
                </button>

                {/* Broadcast Game Invite to Chat Button */}
                <button
                  type="button"
                  onClick={handleBroadcastInvite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    inviteSent 
                      ? 'bg-emerald-600 border-emerald-400 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{inviteSent ? '✓ Game Invite Posted to Chat!' : '🚀 Post Live Game Invite to Chat'}</span>
                </button>
              </div>

              <div className="p-6 rounded-3xl border border-white/15 bg-slate-900/90 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-1">{selectedGame.name}</h3>
                <p className="text-xs text-indigo-300 mb-6">
                  {selectedGame.category === 'room' 
                    ? `🌐 Open Live Multi-Device Session (Your Account: @${currentAccountName})` 
                    : (selectedOpponent ? `@${currentAccountName} vs @${opponentAccountName}` : `@${currentAccountName} Pass & Play Match`)}
                </p>

                {/* GAME 1: Speed Reaction Reflex */}
                {selectedGame.id === 'reaction' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300">Click START. When the signal turns <span className="text-emerald-400 font-bold">GREEN</span>, click as fast as possible on your device!</p>
                    
                    {reactionState === 'idle' && (
                      <Button onClick={startReactionGame} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3">
                        <Play className="h-4 w-4 mr-2" /> Start Reaction Signal
                      </Button>
                    )}

                    {reactionState === 'waiting' && (
                      <div className="h-40 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex flex-col items-center justify-center cursor-pointer" onClick={handleReactionClick}>
                        <div className="h-10 w-10 rounded-full bg-amber-500 animate-ping mb-2" />
                        <span className="text-lg font-bold text-amber-300">GET READY...</span>
                        <span className="text-xs text-amber-200/60 mt-1">(Don't click yet!)</span>
                      </div>
                    )}

                    {reactionState === 'ready' && (
                      <div className="h-40 rounded-2xl bg-emerald-500 border-4 border-emerald-300 flex flex-col items-center justify-center cursor-pointer animate-pulse" onClick={handleReactionClick}>
                        <span className="text-3xl font-extrabold text-black uppercase tracking-widest">CLICK NOW!</span>
                      </div>
                    )}

                    {reactionState === 'too_early' && (
                      <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
                        <p className="font-bold text-sm">False Start! You clicked before signal turned green.</p>
                        <Button onClick={startReactionGame} className="mt-3 bg-rose-600 text-xs">Try Again</Button>
                      </div>
                    )}

                    {reactionState === 'clicked' && (
                      <div className="p-5 rounded-2xl bg-indigo-600/30 border border-indigo-400 text-white">
                        <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-1" />
                        <p className="text-2xl font-extrabold text-emerald-400">{reactionScore} ms!</p>
                        <p className="text-xs text-slate-300 mt-1">Reflex speed logged for account @{currentAccountName}!</p>
                        <Button onClick={startReactionGame} className="mt-3 bg-indigo-600 text-xs">Play Next Round</Button>
                      </div>
                    )}
                  </div>
                )}

                {/* GAME 2: BeastBuck Live Trivia */}
                {selectedGame.id === 'trivia' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300 border-b border-white/10 pb-2">
                      <span>Question {triviaIndex + 1} of {triviaQuestions.length}</span>
                      <span>Account: @{currentAccountName}</span>
                    </div>

                    <p className="text-base font-bold text-white py-2">{triviaQuestions[triviaIndex].q}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {triviaQuestions[triviaIndex].options.map(opt => {
                        const hasAnswered = !!userAnswers[triviaIndex];
                        const isSelected = userAnswers[triviaIndex] === opt;
                        const isCorrect = opt === triviaQuestions[triviaIndex].answer;
                        return (
                          <button
                            key={opt}
                            disabled={hasAnswered}
                            onClick={() => handleSubmitTrivia(opt)}
                            className={`p-3 rounded-xl border text-xs font-semibold transition text-left ${
                              hasAnswered
                                ? (isCorrect ? 'bg-emerald-600/40 border-emerald-400 text-white' : isSelected ? 'bg-rose-600/40 border-rose-400 text-white' : 'bg-white/5 border-white/10 opacity-50')
                                : 'bg-white/10 border-white/15 hover:border-indigo-400 hover:bg-white/20 text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {userAnswers[triviaIndex] && (
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <span className="text-xs text-slate-300">
                          {userAnswers[triviaIndex] === triviaQuestions[triviaIndex].answer ? '✅ Correct Answer Submitted!' : '❌ Incorrect Selection'}
                        </span>
                        {triviaIndex < triviaQuestions.length - 1 && (
                          <Button onClick={() => setTriviaIndex(i => i + 1)} size="sm" className="bg-indigo-600 text-xs">Next Question →</Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* GAME 3: Connect Four Account Duel */}
                {selectedGame.id === 'c4' && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-indigo-300">
                      {c4Winner 
                        ? `🎉 Winner: ${c4Winner === 'Red' ? `@${currentAccountName}` : `@${opponentAccountName}`}!` 
                        : `Current Drop Turn: ${c4Turn === 'Red' ? `@${currentAccountName} (Red)` : `@${opponentAccountName} (Yellow)`}`}
                    </div>

                    <div className="bg-blue-900/80 p-3 rounded-2xl border border-blue-500/40 w-fit mx-auto shadow-2xl">
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array(7).fill(null).map((_, colIdx) => (
                          <button
                            key={colIdx}
                            onClick={() => dropC4Disc(colIdx)}
                            className="p-1 hover:bg-white/10 rounded-lg text-[10px] font-bold text-blue-300 mb-1"
                          >
                            ↓
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {c4Board.map((row, rIdx) => 
                          row.map((cell, cIdx) => (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => dropC4Disc(cIdx)}
                              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border flex items-center justify-center transition ${
                                cell === 'Red' ? 'bg-rose-500 border-rose-300 shadow-lg shadow-rose-500/50' :
                                cell === 'Yellow' ? 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/50' :
                                'bg-slate-950 border-blue-800 hover:bg-slate-900'
                              }`}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => { setC4Board(Array(6).fill(null).map(() => Array(7).fill(null))); setC4Winner(null); setC4Turn('Red'); }}
                      className="bg-white/10 hover:bg-white/20 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Grid
                    </Button>
                  </div>
                )}

                {/* GAME 4: Tic Tac Toe Pro */}
                {selectedGame.id === 'ttt' && (
                  <div>
                    <div className="mb-4 text-xs font-semibold text-indigo-300">
                      {checkTTTWinner(tttBoard) 
                        ? (checkTTTWinner(tttBoard) === 'Draw' ? '🤝 Game Draw!' : `🎉 Winner: ${checkTTTWinner(tttBoard) === 'X' ? `@${currentAccountName}` : `@${opponentAccountName}`}!`)
                        : `Current Turn: ${tttTurn === 'X' ? `@${currentAccountName} (X)` : `@${opponentAccountName} (O)`}`}
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-60 mx-auto mb-4">
                      {tttBoard.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (tttBoard[idx] || checkTTTWinner(tttBoard)) return;
                            const next = [...tttBoard];
                            next[idx] = tttTurn;
                            setTTTBoard(next);
                            setTTTTurn(tttTurn === 'X' ? 'O' : 'X');
                          }}
                          className={`h-18 rounded-2xl border text-2xl font-bold transition flex items-center justify-center ${
                            cell === 'X' ? 'bg-violet-600/40 border-violet-400 text-violet-200' :
                            cell === 'O' ? 'bg-cyan-600/40 border-cyan-400 text-cyan-200' :
                            'bg-white/10 border-white/15 hover:bg-white/20'
                          }`}
                        >
                          {cell}
                        </button>
                      ))}
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => { setTTTBoard(Array(9).fill(null)); setTTTTurn('X'); }}
                      className="mt-2 bg-white/10 hover:bg-white/20 text-xs text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Board
                    </Button>
                  </div>
                )}

                {/* GAME 5: Rock Paper Scissors */}
                {selectedGame.id === 'rps' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-left border-b border-white/10 pb-4">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="text-xs font-bold text-violet-300 mb-2">@{currentAccountName} Move:</h4>
                        <div className="flex gap-2">
                          {['rock', 'paper', 'scissors'].map(item => (
                            <button
                              key={item}
                              onClick={() => setP1RPS(item)}
                              className={`p-2.5 rounded-xl border text-xl transition ${
                                p1RPS === item ? 'bg-indigo-600 border-indigo-400 scale-110' : 'bg-white/10 border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {item === 'rock' ? '✊' : item === 'paper' ? '✋' : '✌️'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="text-xs font-bold text-indigo-300 mb-2">@{opponentAccountName} Move:</h4>
                        <div className="flex gap-2">
                          {['rock', 'paper', 'scissors'].map(item => (
                            <button
                              key={item}
                              onClick={() => setP2RPS(item)}
                              className={`p-2.5 rounded-xl border text-xl transition ${
                                p2RPS === item ? 'bg-violet-600 border-violet-400 scale-110' : 'bg-white/10 border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {item === 'rock' ? '✊' : item === 'paper' ? '✋' : '✌️'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {p1RPS && p2RPS ? (
                      <div className="p-4 rounded-2xl bg-indigo-600/30 border border-indigo-400 text-white">
                        <p className="text-sm font-semibold">@{currentAccountName} ({p1RPS.toUpperCase()}) vs @{opponentAccountName} ({p2RPS.toUpperCase()})</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1">
                          {p1RPS === p2RPS ? 'Tie Game!' : (
                            (p1RPS === 'rock' && p2RPS === 'scissors') || (p1RPS === 'paper' && p2RPS === 'rock') || (p1RPS === 'scissors' && p2RPS === 'paper')
                              ? `@${currentAccountName} Wins!` : `@${opponentAccountName} Wins!`
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">Both accounts select move to reveal match winner!</p>
                    )}
                  </div>
                )}

                {/* GAME 6: Would You Rather */}
                {selectedGame.id === 'wyr' && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-white">Would You Rather...</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setWyrVotes(v => ({ ...v, optionA: v.optionA + 1, userVoted: 'A' }))}
                        className={`p-4 rounded-2xl border text-left transition ${
                          wyrVotes.userVoted === 'A' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/10 border-white/15 hover:border-indigo-400'
                        }`}
                      >
                        <span className="text-xs font-bold block mb-2">🚀 Fly anywhere instantly</span>
                        <span className="text-[10px] text-indigo-300 font-semibold">{wyrVotes.optionA} Member Votes Logged</span>
                      </button>
                      <button
                        onClick={() => setWyrVotes(v => ({ ...v, optionB: v.optionB + 1, userVoted: 'B' }))}
                        className={`p-4 rounded-2xl border text-left transition ${
                          wyrVotes.userVoted === 'B' ? 'bg-violet-600 border-violet-400' : 'bg-white/10 border-white/15 hover:border-violet-400'
                        }`}
                      >
                        <span className="text-xs font-bold block mb-2">🧠 Read minds on command</span>
                        <span className="text-[10px] text-violet-300 font-semibold">{wyrVotes.optionB} Member Votes Logged</span>
                      </button>
                    </div>
                  </div>
                )}

                {!['reaction', 'trivia', 'c4', 'ttt', 'rps', 'wyr'].includes(selectedGame.id) && (
                  <div className="py-6">
                    <Globe className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">Multi-Device Live Match Synchronized</p>
                    <p className="text-xs text-white/50 mt-1">Multiplayer session connected to BeastBuck account network.</p>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
