import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@services/firebase/config';
import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query,
  serverTimestamp, updateDoc, where, limit
} from 'firebase/firestore';
import {
  X, Gamepad2, Target, Brain, RefreshCw, Trophy,
  Send, Users, Zap
} from 'lucide-react';
import Button from '@frontend/components/ui/Button';

/* ═══════════════════════════════════════════════════════════════
   GAME DEFINITIONS — Multiplayer Only (2 real players required)
   ═══════════════════════════════════════════════════════════════ */
const MULTIPLAYER_GAMES = [
  {
    id: 'ttt',
    name: 'Tic-Tac-Toe Duel',
    icon: Target,
    emoji: '❌⭕',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~2 min',
    description: 'Classic 3×3 strategy duel. Align three marks before your opponent does!',
    gradient: 'from-violet-600/30 to-purple-700/20',
    border: 'border-violet-500/40',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/20',
  },
  {
    id: 'c4',
    name: 'Connect Four Duel',
    icon: Target,
    emoji: '🔴🟡',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~3 min',
    description: 'Drop discs into the 7-column grid. First to connect four in a row wins!',
    gradient: 'from-blue-600/30 to-cyan-700/20',
    border: 'border-blue-500/40',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/20',
  },
  {
    id: 'rps',
    name: 'Rock Paper Scissors',
    icon: Gamepad2,
    emoji: '✊✋✌️',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~1 min',
    description: 'Best of 3 showdown! Choose your weapon simultaneously and outsmart your rival!',
    gradient: 'from-amber-600/30 to-orange-700/20',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
  },
  {
    id: 'trivia',
    name: 'Trivia Duel',
    icon: Brain,
    emoji: '🧠⚡',
    players: '2 Players',
    maxPlayers: 2,
    duration: '~3 min',
    description: 'Race through trivia questions. Both answer each question — most correct wins!',
    gradient: 'from-emerald-600/30 to-teal-700/20',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20',
  },
];

/* ═══════════════════════════════════════════════════════════════
   TRIVIA QUESTIONS
   ═══════════════════════════════════════════════════════════════ */
const TRIVIA_QUESTIONS = [
  { q: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Array', 'Tree'], answer: 'Queue' },
  { q: 'What is the approximate speed of light?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'], answer: '300,000 km/s' },
  { q: 'HTTP status code for "Created"?', options: ['200', '201', '404', '500'], answer: '201' },
  { q: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], answer: 'Cascading Style Sheets' },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
];

/* ═══════════════════════════════════════════════════════════════
   GAME LOGIC HELPERS
   ═══════════════════════════════════════════════════════════════ */
function initialGameState(gameId) {
  console.log('Initializing game state for:', gameId);
  switch (gameId) {
    case 'ttt':
      const tttState = { board: Array(9).fill(null), currentTurn: 'player1', winner: null };
      console.log('TTT initial state:', tttState);
      return tttState;
    case 'c4':
      const c4State = { board: Array(42).fill(null), currentTurn: 'player1', winner: null };
      console.log('C4 initial state:', c4State);
      return c4State;
    case 'rps':
      const rpsState = { p1Choice: null, p2Choice: null, round: 1, p1Score: 0, p2Score: 0, bestOf: 3, roundHistory: [] };
      console.log('RPS initial state:', rpsState);
      return rpsState;
    case 'trivia':
      const triviaState = { questionIndex: 0, p1Answer: null, p2Answer: null, p1Score: 0, p2Score: 0, questionResults: [] };
      console.log('Trivia initial state:', triviaState);
      return triviaState;
    default:
      console.error('Unknown game ID:', gameId);
      return {};
  }
}

const TTT_WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkTTTWinner(board) {
  for (const [a, b, c] of TTT_WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(cell => cell !== null)) return 'draw';
  return null;
}

function checkC4Win(board, row, col, mark) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r * 7 + c] !== mark) break;
      count++;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r * 7 + c] !== mark) break;
      count++;
    }
    if (count >= 4) return true;
  }
  return false;
}

function getRPSResult(p1, p2) {
  if (p1 === p2) return 'draw';
  if ((p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper')) return 'player1';
  return 'player2';
}

const RPS_EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' };

/* ═══════════════════════════════════════════════════════════════
   FIRESTORE REFS
   ═══════════════════════════════════════════════════════════════ */
const gamesCol = () => collection(db, 'gameSessions');
const gameDocRef = (id) => doc(db, 'gameSessions', id);

/* ═══════════════════════════════════════════════════════════════
   CHAT GAMES MODAL — Real-Time Multiplayer
   ═══════════════════════════════════════════════════════════════ */
export function ChatGamesModal({ onClose, currentUser, activeRoomId = 'general', onSendGameCard, joinSessionId = null }) {
  // ─── State ───────────────────────────────────────────
  const [phase, setPhase] = useState(joinSessionId ? 'playing' : 'select'); // 'select' | 'lobby' | 'playing'
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessionId, setSessionId] = useState(joinSessionId);
  const [session, setSession] = useState(null);
  const [myRole, setMyRole] = useState(null); // 'player1' | 'player2'
  const [waitingSessions, setWaitingSessions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState(null);

  const currentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You';
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Debug: Log current user state
  useEffect(() => {
    console.log('Game Modal - Current user:', currentUser);
    console.log('Game Modal - Current name:', currentName);
    console.log('Game Modal - Current phase:', phase);
  }, [currentUser, currentName, phase]);

  // ─── Handle modal close with cleanup ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    // Cancel waiting session if we're the creator
    if (sessionId && session?.status === 'waiting' && myRole === 'player1') {
      console.log('Cancelling game session on modal close:', sessionId);
      deleteDoc(gameDocRef(sessionId)).catch((err) => {
        console.error('Failed to cancel game session on close:', err);
      });
    }
    onClose();
  }, [sessionId, session?.status, myRole, onClose]);

  // ─── Subscribe to active session ───────────────────────
  useEffect(() => {
    if (!sessionId) return;
    let hasJoined = false;

    const unsub = onSnapshot(gameDocRef(sessionId), async (snap) => {
      if (!snap.exists()) {
        setSession(null);
        setError('Game session not found or was deleted');
        return;
      }
      const data = { id: snap.id, ...snap.data() };
      setSession(data);
      setError(null);

      // Auto-determine role
      if (data.player1?.uid === currentUser?.uid) {
        setMyRole('player1');
      } else if (data.player2?.uid === currentUser?.uid) {
        setMyRole('player2');
      } else if (data.status === 'waiting' && !hasJoined && joinSessionId) {
        // Auto-join for joinSessionId scenario
        hasJoined = true;
        try {
          await updateDoc(gameDocRef(sessionId), {
            player2: { uid: currentUser.uid, displayName: currentName },
            status: 'active',
            updatedAt: serverTimestamp(),
          });
          setMyRole('player2');
        } catch (err) {
          console.error('Auto-join failed:', err);
          setError('Failed to join game session');
        }
      }

      // Set game definition if not set
      setSelectedGame(prev => {
        if (prev) return prev;
        return MULTIPLAYER_GAMES.find(g => g.id === data.gameId) || null;
      });

      // Transition to playing when active
      if (data.status === 'active' && phaseRef.current === 'lobby') {
        setPhase('playing');
      }
    }, (err) => {
      console.error('Session subscription error:', err);
      setError('Failed to connect to game session');
    });

    return unsub;
  }, [sessionId, currentUser?.uid, currentName, joinSessionId]);

  // ─── Subscribe to waiting sessions (lobby) ────────────
  useEffect(() => {
    if (phase !== 'lobby' || !selectedGame) return;
    const q = query(gamesCol(), where('status', '==', 'waiting'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => {
          if (s.roomId !== activeRoomId) return false;
          if (s.gameId !== selectedGame.id) return false;
          if (s.player1?.uid === currentUser?.uid) return false; // Don't show own sessions
          if (!s.player1?.uid) return false; // Invalid session
          const created = s.createdAt?.toMillis?.() || 0;
          return created > fifteenMinAgo;
        });
      setWaitingSessions(filtered);
    }, (err) => {
      console.error('Failed to subscribe to waiting sessions:', err);
    });
    return unsub;
  }, [phase, selectedGame?.id, activeRoomId, currentUser?.uid]);

  // ─── Cleanup waiting session on unmount or close ────────────────
  const sessionIdRef = useRef(sessionId);
  const myRoleRef = useRef(myRole);
  const sessionStatusRef = useRef(session?.status);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);
  useEffect(() => { sessionStatusRef.current = session?.status; }, [session?.status]);

  // Auto-cancel waiting session when creator leaves modal or navigates away
  useEffect(() => {
    return () => {
      // Only delete if we're the creator and session is still waiting
      if (sessionIdRef.current && sessionStatusRef.current === 'waiting' && myRoleRef.current === 'player1') {
        console.log('Auto-cancelling game session as creator left modal:', sessionIdRef.current);
        deleteDoc(gameDocRef(sessionIdRef.current)).catch((err) => {
          console.error('Failed to cleanup game session:', err);
        });
      }
    };
  }, []);

  // ─── Actions ─────────────────────────────────────────
  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setPhase('lobby');
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setWaitingSessions([]);
    setError(null);
  };

  const handleCreateSession = async () => {
    if (isCreating || !selectedGame || !currentUser?.uid) {
      if (!currentUser?.uid) {
        setError('You must be logged in to create a game');
      }
      return;
    }

    // Check if user already has an active session
    if (sessionId && session?.status === 'waiting') {
      setError('You already have an active game session waiting for an opponent');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      console.log('Creating game session for:', selectedGame.id, 'user:', currentUser.uid);
      const gameState = initialGameState(selectedGame.id);
      console.log('Initial game state:', gameState);

      // Validate game state before creating
      if (!gameState || Object.keys(gameState).length === 0) {
        throw new Error('Invalid game state generated');
      }

      const ref = await addDoc(gamesCol(), {
        gameId: selectedGame.id,
        roomId: activeRoomId,
        status: 'waiting',
        player1: { uid: currentUser.uid, displayName: currentName },
        player2: null,
        gameState: gameState,
        winner: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Game session created with ID:', ref.id);
      setSessionId(ref.id);
      setMyRole('player1');
      setError(null);
    } catch (err) {
      console.error('Failed to create game session:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to create game session: ${errorMessage}`);
      setSessionId(null);
      setMyRole(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (id) => {
    if (!currentUser?.uid) {
      setError('You must be logged in to join a game');
      return;
    }

    // Check if we're already in this session
    if (sessionId === id) {
      setError('You are already in this game session');
      return;
    }

    try {
      console.log('Joining game session:', id, 'as user:', currentUser.uid);

      // First check if session still exists and is waiting
      const snap = await getDoc(gameDocRef(id));

      if (!snap.exists()) {
        setError('This game session no longer exists');
        return;
      }

      const sessionData = snap.data();
      if (sessionData.status !== 'waiting') {
        setError('This game is no longer available to join');
        return;
      }

      if (sessionData.player1?.uid === currentUser?.uid) {
        setError('You cannot join your own game session');
        return;
      }

      await updateDoc(gameDocRef(id), {
        player2: { uid: currentUser.uid, displayName: currentName },
        status: 'active',
        updatedAt: serverTimestamp(),
      });

      console.log('Successfully joined game session:', id);
      setSessionId(id);
      setMyRole('player2');
      setPhase('playing');
      setError(null);
    } catch (err) {
      console.error('Failed to join session:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to join game: ${errorMessage}`);
    }
  };

  const handleBroadcast = () => {
    if (!selectedGame || !sessionId) return;
    onSendGameCard?.({
      gameId: selectedGame.id,
      title: selectedGame.name,
      description: selectedGame.description,
      sessionId,
    });
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleCancelSession = async () => {
    if (sessionId && session?.status === 'waiting' && myRole === 'player1') {
      try {
        await deleteDoc(gameDocRef(sessionId));
        console.log('Game session cancelled:', sessionId);
      } catch (err) {
        console.error('Failed to cancel game session:', err);
        setError('Failed to cancel game session');
      }
    }
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setError(null);
  };

  const handleBackToSelect = () => {
    handleCancelSession();
    setSelectedGame(null);
    setPhase('select');
    setWaitingSessions([]);
    setError(null);
  };

  const handleNewGame = () => {
    setSessionId(null);
    setSession(null);
    setMyRole(null);
    setPhase('lobby');
    setError(null);
  };

  // ─── Game Move Handlers ──────────────────────────────
  const gs = session?.gameState;
  const p1Name = session?.player1?.displayName || 'Player 1';
  const p2Name = session?.player2?.displayName || 'Player 2';
  const opponentName = myRole === 'player1' ? p2Name : p1Name;
  const isMyTurn = gs?.currentTurn === myRole;
  const isFinished = session?.status === 'finished' || !!gs?.winner;

  // TTT Move
  const handleTTTMove = async (idx) => {
    if (!gs || gs.winner || gs.board[idx] || !isMyTurn || !sessionId) return;
    try {
      const newBoard = [...gs.board];
      const mark = myRole === 'player1' ? 'X' : 'O';
      newBoard[idx] = mark;
      const rawWinner = checkTTTWinner(newBoard);
      let winner = null;
      if (rawWinner === 'draw') winner = 'draw';
      else if (rawWinner === 'X') winner = 'player1';
      else if (rawWinner === 'O') winner = 'player2';

      const newState = { ...gs, board: newBoard, currentTurn: myRole === 'player1' ? 'player2' : 'player1', winner };
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (winner) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to make TTT move:', err);
      setError('Failed to make move. Please try again.');
    }
  };

  // C4 Drop
  const handleC4Drop = async (col) => {
    if (!gs || gs.winner || !isMyTurn || !sessionId) return;
    try {
      const board = [...gs.board];
      let row = -1;
      for (let r = 5; r >= 0; r--) {
        if (!board[r * 7 + col]) { row = r; break; }
      }
      if (row === -1) return;
      const mark = myRole === 'player1' ? 'Red' : 'Yellow';
      board[row * 7 + col] = mark;
      const won = checkC4Win(board, row, col, mark);
      const isDraw = !won && board.every(c => c !== null);
      const winner = won ? myRole : isDraw ? 'draw' : null;

      const newState = { ...gs, board, currentTurn: myRole === 'player1' ? 'player2' : 'player1', winner };
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (winner) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to make C4 move:', err);
      setError('Failed to make move. Please try again.');
    }
  };

  // RPS Choice (uses dot-notation partial field update to avoid write conflicts)
  const handleRPSChoice = async (choice) => {
    if (!gs || !sessionId) return;
    try {
      const myField = myRole === 'player1' ? 'p1Choice' : 'p2Choice';
      if (gs[myField]) return; // already chosen
      await updateDoc(gameDocRef(sessionId), {
        [`gameState.${myField}`]: choice,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to make RPS choice:', err);
      setError('Failed to submit choice. Please try again.');
    }
  };

  // RPS advance to next round
  const handleRPSNextRound = async () => {
    if (!gs || !gs.p1Choice || !gs.p2Choice || !sessionId) return;
    try {
      const result = getRPSResult(gs.p1Choice, gs.p2Choice);
      const newP1Score = result === 'player1' ? gs.p1Score + 1 : gs.p1Score;
      const newP2Score = result === 'player2' ? gs.p2Score + 1 : gs.p2Score;
      const winsNeeded = Math.ceil(gs.bestOf / 2);
      const gameOver = newP1Score >= winsNeeded || newP2Score >= winsNeeded;

      const newState = {
        ...gs,
        p1Choice: null, p2Choice: null,
        round: gs.round + 1,
        p1Score: newP1Score, p2Score: newP2Score,
        roundHistory: [...(gs.roundHistory || []), { round: gs.round, p1Choice: gs.p1Choice, p2Choice: gs.p2Choice, winner: result }],
      };
      if (gameOver) newState.winner = newP1Score >= winsNeeded ? 'player1' : 'player2';
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (gameOver) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to advance RPS round:', err);
      setError('Failed to advance round. Please try again.');
    }
  };

  // Trivia answer (uses dot-notation partial field update)
  const handleTriviaAnswer = async (answer) => {
    if (!gs || !sessionId) return;
    try {
      const myField = myRole === 'player1' ? 'p1Answer' : 'p2Answer';
      if (gs[myField]) return;
      await updateDoc(gameDocRef(sessionId), {
        [`gameState.${myField}`]: answer,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to submit trivia answer:', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  // Trivia advance to next question
  const handleTriviaNext = async () => {
    if (!gs || !gs.p1Answer || !gs.p2Answer || !sessionId) return;
    try {
      const correct = TRIVIA_QUESTIONS[gs.questionIndex]?.answer;
      const newP1Score = gs.p1Answer === correct ? gs.p1Score + 1 : gs.p1Score;
      const newP2Score = gs.p2Answer === correct ? gs.p2Score + 1 : gs.p2Score;
      const isLast = gs.questionIndex + 1 >= TRIVIA_QUESTIONS.length;

      const newState = {
        ...gs,
        p1Answer: null, p2Answer: null,
        questionIndex: gs.questionIndex + 1,
        p1Score: newP1Score, p2Score: newP2Score,
        questionResults: [...(gs.questionResults || []), { q: gs.questionIndex, p1Answer: gs.p1Answer, p2Answer: gs.p2Answer, correct }],
      };
      if (isLast) {
        newState.winner = newP1Score > newP2Score ? 'player1' : newP2Score > newP1Score ? 'player2' : 'draw';
      }
      const updates = { gameState: newState, updatedAt: serverTimestamp() };
      if (isLast) updates.status = 'finished';
      await updateDoc(gameDocRef(sessionId), updates);
    } catch (err) {
      console.error('Failed to advance trivia question:', err);
      setError('Failed to advance question. Please try again.');
    }
  };

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-3 sm:p-4 animate-fade-in" onClick={handleClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {phase !== 'select' && (
              <button
                onClick={isFinished || phase === 'lobby' ? handleBackToSelect : handleBackToSelect}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition mr-1 text-sm"
              >
                ←
              </button>
            )}
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {phase === 'select' ? 'Multiplayer Arena' : selectedGame?.name || 'Game'}
              </h2>
              <p className="text-xs text-white/50">
                {phase === 'select' && 'Real-time multiplayer duels — another member must join to play'}
                {phase === 'lobby' && (sessionId ? 'Waiting for opponent to join…' : 'Create or join a duel')}
                {phase === 'playing' && (isFinished ? 'Game Over' : (isMyTurn ? "✨ It's your turn!" : "⏳ Opponent's turn…"))}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ═══ BODY ═══ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">

          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          )}

          {/* ═══ PHASE: SELECT ═══ */}
          {phase === 'select' && (
            <div>
              <p className="text-sm text-white/60 mb-5 text-center">
                Every game requires another member to join before it starts. Choose a game to create or find a duel!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MULTIPLAYER_GAMES.map((game) => {
                  const Icon = game.icon;
                  return (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className={`p-5 rounded-2xl border ${game.border} bg-gradient-to-br ${game.gradient} hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer group flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl border ${game.border} ${game.accentBg} ${game.accent}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${game.border} ${game.accentBg} ${game.accent}`}>
                            {game.players}
                          </span>
                        </div>
                        <div className="text-2xl mb-2">{game.emoji}</div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">{game.name}</h3>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">{game.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-white/40 font-semibold">
                        <span>⏱️ {game.duration}</span>
                        <span className={`${game.accent} group-hover:underline flex items-center gap-1`}>Open Arena →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ PHASE: LOBBY ═══ */}
          {phase === 'lobby' && (
            <div className="max-w-lg mx-auto">

              {/* Waiting for opponent (session created) */}
              {sessionId && session?.status === 'waiting' && (
                <div className="text-center py-8">
                  {/* Radar pulse animation with enhanced highlight */}
                  <div className="relative w-36 h-36 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping" />
                    <div className="absolute inset-3 rounded-full border-2 border-indigo-400/40 animate-ping" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute inset-6 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-18 w-18 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/30" style={{ width: 72, height: 72 }}>
                        {currentName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {/* Your Game badge */}
                    <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-indigo-500 border-2 border-indigo-300 text-[10px] font-bold text-white shadow-lg">
                      Your Game
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">Searching for Opponent…</h3>
                  <p className="text-xs text-white/50 mb-6">
                    Another member needs to join this <strong className="text-indigo-300">{selectedGame?.name}</strong> duel before the game starts.
                  </p>

                  <div className="flex flex-col gap-3 items-center">
                    <button
                      onClick={handleBroadcast}
                      disabled={inviteSent}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
                        inviteSent
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      {inviteSent ? '✓ Challenge Posted to Chat!' : '🚀 Broadcast Challenge to Chat'}
                    </button>

                    <button onClick={() => { handleCancelSession(); }} className="text-xs text-white/40 hover:text-white/70 transition mt-2">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* No session yet — Create or Join */}
              {!sessionId && (
                <div className="space-y-5">
                  <button
                    onClick={handleCreateSession}
                    disabled={isCreating || !currentUser?.uid}
                    className={`w-full p-5 rounded-2xl border transition-all duration-300 text-center group ${
                      !currentUser?.uid
                        ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
                        : 'border-indigo-500/40 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/30 hover:to-violet-600/30 cursor-pointer'
                    }`}
                  >
                    <div className="text-3xl mb-2">⚔️</div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                      {!currentUser?.uid ? 'Login Required' : isCreating ? 'Creating Duel…' : 'Create New Duel'}
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      {!currentUser?.uid ? 'You must be logged in to create games' : 'Start a session and wait for an opponent to join'}
                    </p>
                  </button>

                  {/* Open duels from other players */}
                  {waitingSessions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Open Duels in this Room ({waitingSessions.length})
                      </h4>
                      <div className="space-y-2">
                        {waitingSessions.map(s => {
                          const isMyGame = s.player1?.uid === currentUser?.uid;
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                                isMyGame
                                  ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/30'
                                  : 'border-white/10 bg-white/5 hover:bg-white/8'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                  isMyGame
                                    ? 'bg-gradient-to-br from-indigo-500 to-violet-500 ring-2 ring-indigo-300'
                                    : 'bg-gradient-to-br from-indigo-600 to-violet-600'
                                }`}>
                                  {(s.player1?.displayName || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">{s.player1?.displayName || 'Unknown'}</p>
                                    {isMyGame && (
                                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-[10px] font-bold text-indigo-300">
                                        Your Game
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-white/40 flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse inline-block ${isMyGame ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                                    Waiting for opponent…
                                  </p>
                                </div>
                              </div>
                              {!isMyGame && (
                                <button
                                  onClick={() => handleJoinSession(s.id)}
                                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95"
                                >
                                  Join Duel
                                </button>
                              )}
                              {isMyGame && (
                                <button
                                  onClick={() => handleCancelSession()}
                                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold transition border border-rose-400/30 active:scale-95"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {waitingSessions.length === 0 && (
                    <div className="text-center py-4 text-xs text-white/40">
                      <p>No open duels for <strong className="text-white/60">{selectedGame?.name}</strong> in this room.</p>
                      <p className="mt-1">Create one and invite members!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ PHASE: PLAYING ═══ */}
          {phase === 'playing' && session && gs && (
            <div className="max-w-xl mx-auto">

              {/* Player Bar */}
              <div className="flex items-center justify-between mb-5 p-3 rounded-2xl border border-white/10 bg-white/5">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                  gs.currentTurn === 'player1' && !isFinished ? 'bg-violet-600/30 border border-violet-400/50 shadow-lg shadow-violet-500/10' : ''
                }`}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    {p1Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[120px]">{p1Name}</p>
                    <p className="text-[10px] text-violet-300">
                      {selectedGame?.id === 'ttt' ? 'X' : selectedGame?.id === 'c4' ? '🔴 Red' : 'P1'}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-white/40">
                  {isFinished ? <span className="text-amber-400">🏆 OVER</span> : 'VS'}
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                  gs.currentTurn === 'player2' && !isFinished ? 'bg-cyan-600/30 border border-cyan-400/50 shadow-lg shadow-cyan-500/10' : ''
                }`}>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[120px] text-right">{p2Name}</p>
                    <p className="text-[10px] text-cyan-300 text-right">
                      {selectedGame?.id === 'ttt' ? 'O' : selectedGame?.id === 'c4' ? '🟡 Yellow' : 'P2'}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    {p2Name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Score Bar (RPS & Trivia) */}
              {(selectedGame?.id === 'rps' || selectedGame?.id === 'trivia') && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-lg font-extrabold text-violet-400">{gs.p1Score || 0}</span>
                  <span className="text-white/20 text-sm">—</span>
                  <span className="text-lg font-extrabold text-cyan-400">{gs.p2Score || 0}</span>
                </div>
              )}

              {/* Turn Indicator (TTT & C4) */}
              {!isFinished && (selectedGame?.id === 'ttt' || selectedGame?.id === 'c4') && (
                <div className={`text-center text-xs font-bold mb-4 py-2 rounded-xl border transition-all duration-300 ${
                  isMyTurn
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}>
                  {isMyTurn ? "✨ Your turn — make your move!" : "⏳ Waiting for opponent's move…"}
                </div>
              )}

              {/* ─── TTT BOARD ─── */}
              {selectedGame?.id === 'ttt' && !isFinished && (
                <div className="grid grid-cols-3 gap-2.5 w-64 mx-auto mb-5">
                  {gs.board.map((cell, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTTTMove(idx)}
                      disabled={!!cell || !isMyTurn || isFinished}
                      className={`h-[76px] rounded-2xl border text-2xl font-bold transition-all duration-200 flex items-center justify-center ${
                        cell === 'X' ? 'bg-violet-600/40 border-violet-400 text-violet-200 shadow-lg shadow-violet-500/20' :
                        cell === 'O' ? 'bg-cyan-600/40 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20' :
                        isMyTurn ? 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-indigo-400 cursor-pointer' :
                        'bg-white/5 border-white/10 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              )}

              {/* ─── C4 BOARD ─── */}
              {selectedGame?.id === 'c4' && !isFinished && (
                <div className="bg-blue-900/80 p-3 rounded-2xl border border-blue-500/40 w-fit mx-auto shadow-2xl mb-5">
                  <div className="grid grid-cols-7 gap-1.5 mb-1">
                    {Array(7).fill(null).map((_, col) => (
                      <button
                        key={col}
                        onClick={() => handleC4Drop(col)}
                        disabled={!isMyTurn || isFinished}
                        className={`p-1 rounded-lg text-[10px] font-bold transition ${
                          isMyTurn ? 'hover:bg-white/10 text-blue-300 cursor-pointer' : 'text-blue-800 cursor-not-allowed'
                        }`}
                      >
                        ↓
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array(6).fill(null).map((_, row) =>
                      Array(7).fill(null).map((_, col) => {
                        const cell = gs.board[row * 7 + col];
                        return (
                          <div
                            key={`${row}-${col}`}
                            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border transition-all duration-300 ${
                              cell === 'Red' ? 'bg-rose-500 border-rose-300 shadow-lg shadow-rose-500/50' :
                              cell === 'Yellow' ? 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/50' :
                              'bg-slate-950 border-blue-800'
                            }`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ─── RPS GAME ─── */}
              {selectedGame?.id === 'rps' && !isFinished && (() => {
                const myChoice = myRole === 'player1' ? gs.p1Choice : gs.p2Choice;
                const oppChoice = myRole === 'player1' ? gs.p2Choice : gs.p1Choice;
                const bothChosen = myChoice && oppChoice;
                const result = bothChosen ? getRPSResult(gs.p1Choice, gs.p2Choice) : null;

                return (
                  <div className="space-y-5">
                    <div className="text-center text-xs font-bold text-indigo-300 mb-2">
                      Round {gs.round} of {gs.bestOf}
                    </div>

                    {bothChosen ? (
                      /* ── Both chosen: REVEAL ── */
                      <div className="text-center space-y-4 py-4">
                        <div className="flex items-center justify-center gap-6 sm:gap-10">
                          <div className="text-center">
                            <div className="text-5xl sm:text-6xl mb-2 animate-bounce" style={{ animationDuration: '0.6s' }}>{RPS_EMOJI[myChoice]}</div>
                            <p className="text-xs font-bold text-violet-300">You</p>
                          </div>
                          <div className="text-lg font-bold text-white/20">VS</div>
                          <div className="text-center">
                            <div className="text-5xl sm:text-6xl mb-2 animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}>{RPS_EMOJI[oppChoice]}</div>
                            <p className="text-xs font-bold text-cyan-300">{opponentName}</p>
                          </div>
                        </div>
                        <div className={`text-lg font-extrabold py-2 ${
                          result === myRole ? 'text-emerald-400' : result === 'draw' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {result === myRole ? '🎉 You Win This Round!' : result === 'draw' ? "🤝 It's a Tie!" : '😔 You Lost This Round'}
                        </div>
                        <button onClick={handleRPSNextRound} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95">
                          Next Round →
                        </button>
                      </div>
                    ) : (
                      /* ── Choosing phase ── */
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <h4 className="text-xs font-bold text-violet-300 mb-3">Your Move:</h4>
                          {!myChoice ? (
                            <div className="flex justify-center gap-3">
                              {['rock', 'paper', 'scissors'].map(item => (
                                <button
                                  key={item}
                                  onClick={() => handleRPSChoice(item)}
                                  className="p-4 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/20 hover:border-indigo-400 transition-all duration-200 text-3xl hover:scale-110 active:scale-95"
                                >
                                  {RPS_EMOJI[item]}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">{RPS_EMOJI[myChoice]}</div>
                              <p className="text-xs text-emerald-400 font-bold">✓ Locked in!</p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                          <h4 className="text-xs font-bold text-cyan-300 mb-2">{opponentName}:</h4>
                          <div className="text-4xl mb-2 opacity-30">❓</div>
                          <p className="text-xs text-white/40">
                            {oppChoice ? '✓ Opponent has chosen! Make your move!' : myChoice ? 'Waiting for opponent…' : 'Both players choose simultaneously'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── TRIVIA DUEL ─── */}
              {selectedGame?.id === 'trivia' && !isFinished && gs.questionIndex < TRIVIA_QUESTIONS.length && (() => {
                const currentQ = TRIVIA_QUESTIONS[gs.questionIndex];
                const myAnswer = myRole === 'player1' ? gs.p1Answer : gs.p2Answer;
                const oppAnswer = myRole === 'player1' ? gs.p2Answer : gs.p1Answer;
                const bothAnswered = gs.p1Answer && gs.p2Answer;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300 border-b border-white/10 pb-2">
                      <span>Question {gs.questionIndex + 1} of {TRIVIA_QUESTIONS.length}</span>
                    </div>

                    <p className="text-base font-bold text-white py-2">{currentQ.q}</p>

                    {!myAnswer ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentQ.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleTriviaAnswer(opt)}
                            className="p-3 rounded-xl border border-white/15 bg-white/10 hover:border-indigo-400 hover:bg-white/20 text-xs font-semibold text-white text-left transition active:scale-[0.98]"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : !bothAnswered ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-3">⏳</div>
                        <p className="text-xs text-emerald-400 font-bold mb-1">Your answer submitted!</p>
                        <p className="text-xs text-white/40">Waiting for opponent to answer…</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentQ.options.map(opt => {
                          const isCorrect = opt === currentQ.answer;
                          const isMine = opt === myAnswer;
                          const isOpp = opt === oppAnswer;
                          return (
                            <div key={opt} className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                              isCorrect ? 'bg-emerald-600/30 border-emerald-400 text-white' :
                              (isMine || isOpp) ? 'bg-rose-600/20 border-rose-400/50 text-white/80' :
                              'bg-white/5 border-white/10 text-white/40'
                            }`}>
                              <span>{opt} {isCorrect && '✅'}</span>
                              <span className="text-[10px] text-white/50">
                                {isMine && isOpp ? `(You & ${opponentName})` : isMine ? '(You)' : isOpp ? `(${opponentName})` : ''}
                              </span>
                            </div>
                          );
                        })}
                        <div className="text-center pt-3">
                          <button
                            onClick={handleTriviaNext}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95"
                          >
                            {gs.questionIndex + 1 >= TRIVIA_QUESTIONS.length ? 'See Final Results' : 'Next Question →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── GAME OVER ─── */}
              {isFinished && (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4 animate-bounce">🏆</div>
                  <h3 className="text-xl font-extrabold text-white mb-1">
                    {gs.winner === 'draw'
                      ? "It's a Draw!"
                      : gs.winner === myRole
                        ? '🎉 You Win!'
                        : `${opponentName} Wins!`}
                  </h3>
                  {gs.winner && gs.winner !== 'draw' && (
                    <p className="text-sm text-white/60 mb-1">
                      Winner: <strong>{gs.winner === 'player1' ? p1Name : p2Name}</strong>
                    </p>
                  )}
                  {(selectedGame?.id === 'rps' || selectedGame?.id === 'trivia') && (
                    <p className="text-xs text-indigo-300 mb-4">
                      Final Score: {p1Name} <strong>{gs.p1Score}</strong> — <strong>{gs.p2Score}</strong> {p2Name}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <button onClick={handleNewGame} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition border border-indigo-400 shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4" /> New Duel
                    </button>
                    <button onClick={handleBackToSelect} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition border border-white/15 active:scale-95">
                      Back to Games
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
