import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { LoadingState } from '@frontend/components/ui/UIElements';
import Button from '@frontend/components/ui/Button';

import { TaskBoard } from './components/TaskBoard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskSubmissionForm } from './components/TaskSubmissionForm';
import { SubmissionReviewModal } from './components/SubmissionReviewModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TasksService } from '@services/firestore/tasks';
import { useAuth } from '../auth/AuthContext';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { cn } from '@shared/lib/utils';
import { 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Search, 
  X, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  Flame, 
  Trophy,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  ArrowRight
} from 'lucide-react';

const TABS = [
  { id: 'MY_TASKS',       label: 'My Tasks',        icon: Target },
  { id: 'GLOBAL_MISSIONS',label: 'Global Missions', icon: Trophy },
  { id: 'REVIEW_QUEUE',   label: 'Review Queue',    icon: CheckCircle, leaderOnly: true },
];

const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.6); }
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

  .glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .text-gradient {
    background: linear-gradient(135deg, #00f0ff 0%, #9333ea 50%, #00f0ff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .bg-gradient-primary {
    background: linear-gradient(135deg, #00f0ff 0%, #9333ea 100%);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: transparent;
  }
`;

const TasksHub = React.memo(function TasksHub() {
  const { user, roleData } = useAuth();

  const isLeader   = hasPermission(roleData?.role, 'canAssignTasks');
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);
  const canCreate  = isLeader || (isApprovedMember && hasPermission(roleData?.role, 'canAssignTasks'));

  const [tasks, setTasks]                 = useState([]);
  const [reviewTasks, setReviewTasks]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState(null);
  const [activeTab, setActiveTab]         = useState('MY_TASKS');
  const [searchQuery, setSearchQuery]     = useState('');

  // Modal state
  const [detailTask, setDetailTask]           = useState(null);
  const [submissionTask, setSubmissionTask]   = useState(null);
  const [reviewTask, setReviewTask]           = useState(null);
  const [showCreate, setShowCreate]           = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [userTasks, pendingReview] = await Promise.all([
        TasksService.getTasksForUser(user.uid),
        isLeader ? TasksService.getTasksUnderReview() : Promise.resolve([]),
      ]);
      setTasks(userTasks);
      setReviewTasks(pendingReview);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setLoadError('Could not load tasks. Check your connection or Firestore permissions.');
    } finally {
      setLoading(false);
    }
  }, [user, isLeader]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Derive what to show in the board
  const boardTasks = (() => {
    let filtered = [];
    if (activeTab === 'MY_TASKS')        filtered = tasks.filter(t => t.assigneeIds?.includes(user?.uid));
    if (activeTab === 'GLOBAL_MISSIONS') filtered = tasks.filter(t => t.type === 'GLOBAL');
    if (activeTab === 'REVIEW_QUEUE')    filtered = reviewTasks;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  })();

  // --- Handlers ---
  const handleTaskClick = (task) => setDetailTask(task);

  const handleTaskUpdated = (updated) => {
    if (!updated) return;
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setDetailTask(updated);
  };

  const handleOpenSubmit = (task) => {
    setDetailTask(null);
    setSubmissionTask(task);
  };

  const handleOpenReview = (task) => {
    setDetailTask(null);
    setReviewTask(task);
  };

  const handleSubmissionSuccess = () => {
    fetchTasks();
    setSubmissionTask(null);
  };

  const handleReviewComplete = () => {
    fetchTasks();
    setReviewTask(null);
  };

  const handleTaskCreated = () => {
    fetchTasks();
    setShowCreate(false);
  };

  const reviewCount = reviewTasks.length;

  // Calculate stats
  const myTasksCount = tasks.filter(t => t.assigneeIds?.includes(user?.uid)).length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const totalXP = tasks.reduce((sum, t) => sum + (t.baseXP || 0), 0);

  return (
    <>
      <style>{animations}</style>
      <PageContainer>
        {/* Hero Section */}
        <div className="mb-8 p-5 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-br from-accent/10 via-violet-500/10 to-cyan-500/10 border border-white/10 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-gradient">Tasks</span> & Missions
              </h1>
              <p className="text-sm sm:text-base text-text-muted max-w-2xl">
                Track assignments, complete missions, and earn XP. Build your skills and advance your career.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {canCreate && (
                <Button 
                  onClick={() => setShowCreate(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Create Task</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <span className="text-xs sm:text-sm text-text-muted">My Tasks</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{myTasksCount}</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                <span className="text-xs sm:text-sm text-text-muted">In Progress</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{inProgressCount}</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                <span className="text-xs sm:text-sm text-text-muted">Completed</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{completedCount}</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                <span className="text-xs sm:text-sm text-text-muted">Total XP</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{totalXP}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-sm sm:text-base text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
          {TABS.filter(t => !t.leaderOnly || isLeader).map((tab, index) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all whitespace-nowrap animate-slide-in",
                  activeTab === tab.id
                    ? "bg-gradient-primary text-white shadow-lg shadow-accent/20"
                    : "bg-white/5 text-text-muted border border-white/10 hover:bg-white/10 hover:text-white"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TabIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tab.label}</span>
                {tab.id === 'REVIEW_QUEUE' && reviewCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-400 text-black text-[10px] sm:text-xs font-bold">
                    {reviewCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty states */}
        {!loading && loadError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-red-400 animate-fade-in">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <div className="font-bold">Tasks could not load</div>
              <div className="text-red-400/80">{loadError}</div>
            </div>
          </div>
        )}

        {!loading && !loadError && boardTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-text-muted" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {activeTab === 'MY_TASKS'        && 'No tasks assigned to you'}
              {activeTab === 'GLOBAL_MISSIONS' && 'No global missions right now'}
              {activeTab === 'REVIEW_QUEUE'    && 'No submissions pending review'}
            </h3>
            <p className="text-sm sm:text-base text-text-muted max-w-xs sm:max-w-md">
              {activeTab === 'MY_TASKS' && 'Check back later or ask your team leader.'}
              {activeTab === 'GLOBAL_MISSIONS' && 'Check back soon for open missions.'}
              {activeTab === 'REVIEW_QUEUE' && 'All submissions have been reviewed.'}
            </p>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <LoadingState text="Loading tasks..." />
          </div>
        ) : !loadError && boardTasks.length > 0 ? (
          <TaskBoard tasks={boardTasks} onTaskClick={handleTaskClick} />
        ) : null}

        {/* --- Modals --- */}

        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            onClose={() => setDetailTask(null)}
            onSubmitProof={handleOpenSubmit}
            onReview={handleOpenReview}
            onTaskUpdated={handleTaskUpdated}
          />
        )}

        {submissionTask && (
          <TaskSubmissionForm
            task={submissionTask}
            onClose={() => setSubmissionTask(null)}
            onSuccess={handleSubmissionSuccess}
          />
        )}

        {reviewTask && (
          <SubmissionReviewModal
            task={reviewTask}
            onClose={() => setReviewTask(null)}
            onReviewed={handleReviewComplete}
          />
        )}

        {showCreate && (
          <CreateTaskModal
            onClose={() => setShowCreate(false)}
            onCreated={handleTaskCreated}
          />
        )}
      </PageContainer>
    </>
  );
});

export default TasksHub;
