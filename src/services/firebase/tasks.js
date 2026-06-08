import { db } from './config';
import {
  collection, addDoc, doc, getDoc, updateDoc, serverTimestamp,
  runTransaction, query, where, getDocs, orderBy, limit
} from 'firebase/firestore';
import { calculateLevel, XP_REWARD_TYPES } from './gamification';

function mapDocs(snap) {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function sortTasks(tasks) {
  const statusOrder = { TODO: 0, IN_PROGRESS: 1, UNDER_REVIEW: 2, COMPLETED: 3, CANCELLED: 4 };
  return [...tasks].sort((a, b) => {
    const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return String(b.createdAt?.seconds || '').localeCompare(String(a.createdAt?.seconds || ''));
  });
}

export const TasksService = {
  /**
   * Fetch relevant tasks for a user (Global + assigned)
   */
  async getTasksForUser(uid) {
    const tasksRef = collection(db, 'tasks');
    const [globalSnap, assignedSnap] = await Promise.all([
      getDocs(query(tasksRef, where('isArchived', '==', false), where('type', '==', 'GLOBAL'))),
      getDocs(query(tasksRef, where('isArchived', '==', false), where('assigneeIds', 'array-contains', uid))),
    ]);

    const byId = new Map();
    for (const task of [...mapDocs(globalSnap), ...mapDocs(assignedSnap)]) {
      byId.set(task.id, task);
    }

    return sortTasks([...byId.values()]);
  },

  /**
   * Fetch all tasks with UNDER_REVIEW status (for CEO review queue)
   */
  async getTasksUnderReview() {
    const q = query(
      collection(db, 'tasks'),
      where('isArchived', '==', false),
      where('status', '==', 'UNDER_REVIEW')
    );
    const snap = await getDocs(q);
    return sortTasks(mapDocs(snap));
  },

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId) {
    const snap = await getDoc(doc(db, 'tasks', taskId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /**
   * Get the most recent PENDING_REVIEW submission for a task
   */
  async getSubmissionForTask(taskId) {
    const q = query(
      collection(db, 'taskSubmissions'),
      where('taskId', '==', taskId),
      where('status', '==', 'PENDING_REVIEW'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  /**
   * Create a new task (Personal, Team, or Global)
   */
  async createTask(data, creatorId) {
    const newTask = {
      ...data,
      creatorId,
      status: 'TODO',
      progressPercent: 0,
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    return docRef.id;
  },

  /**
   * Update task progress and derive new status
   */
  async updateProgress(taskId, progressPercent, status) {
    await updateDoc(doc(db, 'tasks', taskId), {
      progressPercent,
      status,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Submit proof for a task
   */
  async submitTaskProof(taskId, authorId, proofText, attachments = []) {
    const submission = {
      taskId,
      authorId,
      status: 'PENDING_REVIEW',
      proofText,
      attachments, // [{ type, name, url, uploadedAt }]
      createdAt: serverTimestamp(),
    };

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status: 'UNDER_REVIEW', updatedAt: serverTimestamp() });

    const docRef = await addDoc(collection(db, 'taskSubmissions'), submission);
    return docRef.id;
  },

  /**
   * CEO/Leader Review: Approve or reject a submission transactionally.
   * On APPROVED: marks task COMPLETED, awards XP, logs to xpLogs & activityLogs.
   * On REJECTED: reverts task to IN_PROGRESS for rework.
   */
  async reviewSubmission(submissionId, taskId, authorId, status, feedback, baseXP, bonusXP = 0) {
    await runTransaction(db, async (transaction) => {
      const submissionRef = doc(db, 'taskSubmissions', submissionId);
      const taskRef      = doc(db, 'tasks', taskId);
      const userRef      = doc(db, 'users', authorId);
      const xpLogRef     = doc(collection(db, 'xpLogs'));
      const activityRef  = doc(collection(db, 'activityLogs'));

      const totalXP = baseXP + bonusXP;

      // 1. Update Submission record
      transaction.update(submissionRef, {
        status,
        feedback,
        xpAwarded: { baseXP, bonusXP, totalXP },
        reviewedAt: serverTimestamp(),
      });

      if (status === 'APPROVED') {
        // 2. Mark task COMPLETED
        transaction.update(taskRef, {
          status: 'COMPLETED',
          progressPercent: 100,
          updatedAt: serverTimestamp(),
        });

        // 3. Award XP atomically
        const userSnap = await transaction.get(userRef);
        const currentXP = userSnap.exists() ? (userSnap.data().xp || 0) : 0;
        const nextXP = currentXP + totalXP;
        transaction.update(userRef, {
          xp: nextXP,
          level: calculateLevel(nextXP),
          'stats.tasksCompleted': (userSnap.data()?.stats?.tasksCompleted || 0) + 1,
        });

        // 4. XP audit log
        transaction.set(xpLogRef, {
          userId: authorId,
          amount: totalXP,
          baseXP,
          bonusXP,
          reason: `Task completion: ${taskId}`,
          sourceType: XP_REWARD_TYPES.TASK,
          sourceId: taskId,
          actorId: null,
          metadata: { submissionId },
          createdAt: serverTimestamp(),
          timestamp: serverTimestamp(),
        });

        // 5. Global activity feed
        transaction.set(activityRef, {
          type: 'TASK_COMPLETED',
          title: 'Mission Accomplished',
          description: `A member completed a mission and earned ${totalXP} XP.`,
          userId: authorId,
          metadata: { taskId, totalXP, baseXP, bonusXP },
          timestamp: serverTimestamp(),
        });
      } else {
        // Rejected — revert to IN_PROGRESS for rework
        transaction.update(taskRef, {
          status: 'IN_PROGRESS',
          updatedAt: serverTimestamp(),
        });
      }
    });
  },

  /**
   * Soft-delete a task (archive)
   */
  async archiveTask(taskId, archivedBy) {
    await updateDoc(doc(db, 'tasks', taskId), {
      isArchived: true,
      archivedAt: serverTimestamp(),
      archivedBy,
      updatedAt: serverTimestamp(),
    });
  },
};
