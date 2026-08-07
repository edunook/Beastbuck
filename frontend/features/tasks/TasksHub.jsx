import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { CardSkeleton } from '@frontend/components/ui/Skeleton';
import Button from '@frontend/components/ui/Button';

import { TaskBoard } from './components/TaskBoard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskSubmissionForm } from './components/TaskSubmissionForm';
import { SubmissionReviewModal } from './components/SubmissionReviewModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TasksService } from '@services/firestore/tasks';
import { useAuth } from '../auth/AuthContext';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { AlertCircle, Plus, RefreshCw, Search, X } from 'lucide-react';

const TABS = [
  { id: 'MY_TASKS',       label: 'My Tasks' },
  { id: 'GLOBAL_MISSIONS',label: 'Global Missions' },
  { id: 'REVIEW_QUEUE',   label: 'Review Queue', leaderOnly: true },
];

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

  return (
    <PageContainer>
      <PageHeader
        title="Tasks & Missions"
        description="Track assignments, complete missions, and earn XP."
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {canCreate && (
              <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Task
              </Button>
            )}
          </div>
        }
      />

      <SectionWrapper>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-10 pr-10 py-2.5 bg-black/30 border border-border rounded-xl text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black/20 rounded-2xl p-1 border border-border/50 overflow-x-auto custom-scrollbar w-fit max-w-full">
          {TABS.filter(t => !t.leaderOnly || isLeader).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent shadow-sm'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {tab.id === 'REVIEW_QUEUE' && reviewCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty states */}
        {!loading && loadError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-bold">Tasks could not load</div>
              <div className="text-status-danger/80">{loadError}</div>
            </div>
          </div>
        )}

        {!loading && !loadError && boardTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-border/50 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-white font-bold mb-2">
              {activeTab === 'MY_TASKS'        && 'No tasks assigned to you'}
              {activeTab === 'GLOBAL_MISSIONS' && 'No global missions right now'}
              {activeTab === 'REVIEW_QUEUE'    && 'No submissions pending review'}
            </h3>
            <p className="text-text-muted text-sm max-w-xs">
              {activeTab === 'MY_TASKS' && 'Check back later or ask your team leader.'}
              {activeTab === 'GLOBAL_MISSIONS' && 'Check back soon for open missions.'}
              {activeTab === 'REVIEW_QUEUE' && 'All submissions have been reviewed.'}
            </p>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : !loadError && boardTasks.length > 0 ? (
          <TaskBoard tasks={boardTasks} onTaskClick={handleTaskClick} />
        ) : null}
      </SectionWrapper>

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
  );
});

export default TasksHub;
