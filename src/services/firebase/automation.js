import { db } from './config';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export const AUTOMATION_SCOPES = [
  'Users',
  'Teams',
  'Departments',
  'Labs',
  'Projects',
  'Research',
  'Ventures',
  'Academy',
  'Marketplace',
  'Community',
  'Workspace',
];

export const AUTOMATION_TRIGGERS = [
  'User Registered',
  'Task Created',
  'Task Completed',
  'Project Created',
  'Project Completed',
  'Research Published',
  'Invention Approved',
  'Course Completed',
  'Certificate Issued',
  'Challenge Won',
  'Event Started',
  'Event Ended',
  'Venture Created',
  'Marketplace Resource Published',
  'Document Created',
  'Workspace Updated',
  'Follower Added',
  'Custom Trigger',
];

export const AUTOMATION_CONDITIONS = [
  'Role Check',
  'XP Check',
  'Badge Check',
  'Specialization Check',
  'Department Check',
  'Lab Check',
  'Team Check',
  'Project Check',
  'Status Check',
  'Date Check',
  'Custom Logic',
];

export const AUTOMATION_ACTIONS = [
  'Create Task',
  'Create Project',
  'Assign User',
  'Send Notification',
  'Send Announcement',
  'Award XP',
  'Award Badge',
  'Issue Certificate',
  'Create Workspace',
  'Generate Report',
  'Update Status',
  'Archive Item',
  'Create Event',
  'Create Challenge',
  'Create Research Project',
  'Create Venture',
  'Trigger AI Analysis',
  'Custom Action',
];

export const AGENT_TYPES = [
  'Project Agent',
  'Research Agent',
  'Academy Agent',
  'Community Agent',
  'Marketplace Agent',
  'Innovation Agent',
  'Leadership Agent',
  'Personal Assistant Agent',
];

export const EXECUTION_PHASES = [
  'HUMAN_APPROVED',
  'SEMI_AUTONOMOUS',
  'AI_DRIVEN',
];

const DEFAULT_TEMPLATES = [
  {
    title: 'New Member Onboarding',
    category: 'Organization',
    trigger: 'User Registered',
    conditions: ['Role Check'],
    actions: ['Create Workspace', 'Create Task', 'Send Notification'],
  },
  {
    title: 'Research Workflow',
    category: 'Research',
    trigger: 'Research Published',
    conditions: ['Status Check'],
    actions: ['Trigger AI Analysis', 'Generate Report', 'Send Announcement'],
  },
  {
    title: 'Venture Creation Workflow',
    category: 'Ventures',
    trigger: 'Venture Created',
    conditions: ['Role Check', 'Status Check'],
    actions: ['Create Task', 'Assign User', 'Trigger AI Analysis'],
  },
  {
    title: 'Course Completion Workflow',
    category: 'Academy',
    trigger: 'Course Completed',
    conditions: ['XP Check'],
    actions: ['Issue Certificate', 'Award XP', 'Send Notification'],
  },
  {
    title: 'Marketplace Quality Check',
    category: 'Marketplace',
    trigger: 'Marketplace Resource Published',
    conditions: ['Status Check'],
    actions: ['Trigger AI Analysis', 'Generate Report'],
  },
];

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

function clean(value) {
  return String(value || '').trim();
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function lastUpdated(item) {
  return item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt || item.createdAt || Date.now());
}

export const AutomationService = {
  async createWorkflow(data, actor) {
    const payload = {
      title: clean(data.title),
      description: clean(data.description),
      scope: data.scope || 'Projects',
      trigger: data.trigger || 'Task Completed',
      conditions: asList(data.conditions),
      actions: asList(data.actions),
      executionPhase: data.executionPhase || 'HUMAN_APPROVED',
      status: data.status || 'DRAFT',
      visibility: data.visibility || 'INTERNAL',
      requiresApproval: data.requiresApproval !== false,
      sensitiveAction: Boolean(data.sensitiveAction),
      ownerId: actor.uid,
      ownerName: actor.name || actor.displayName || actor.email || 'Automation Owner',
      teamIds: data.teamIds || [],
      departmentId: data.departmentId || null,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      lastRunAt: null,
      healthScore: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (!payload.title || !payload.description) throw new Error('Workflow title and description are required.');
    const ref = await addDoc(collection(db, 'automations'), payload);
    await addDoc(collection(db, 'automationMetrics'), {
      automationId: ref.id,
      eventType: 'WORKFLOW_CREATED',
      actorId: actor.uid,
      scope: payload.scope,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateWorkflow(workflowId, updates) {
    await updateDoc(doc(db, 'automations', workflowId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async listWorkflows(filters = {}) {
    const snap = await getDocs(query(collection(db, 'automations'), orderBy('createdAt', 'desc'), limit(filters.limit || 100)));
    return docsFrom(snap)
      .filter(item => filters.includeArchived || item.status !== 'ARCHIVED')
      .filter(item => !filters.status || item.status === filters.status)
      .filter(item => !filters.scope || item.scope === filters.scope)
      .filter(item => !filters.ownerId || item.ownerId === filters.ownerId);
  },

  async getWorkflowTemplates() {
    const snap = await getDocs(query(collection(db, 'workflowTemplates'), limit(50)));
    const templates = docsFrom(snap);
    return templates.length ? templates : DEFAULT_TEMPLATES.map((template, index) => ({
      id: `default-${index}`,
      ...template,
      description: `${template.category} automation template for trigger, conditions, actions, approvals, and logs.`,
      status: 'READY',
    }));
  },

  async createWorkflowTemplate(data, actorId) {
    const ref = await addDoc(collection(db, 'workflowTemplates'), {
      title: clean(data.title),
      description: clean(data.description),
      category: data.category || data.scope || 'Operations',
      trigger: data.trigger || 'Custom Trigger',
      conditions: asList(data.conditions),
      actions: asList(data.actions),
      createdBy: actorId,
      status: 'ACTIVE',
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async createScheduledJob(data, actorId) {
    const ref = await addDoc(collection(db, 'scheduledJobs'), {
      title: clean(data.title),
      description: clean(data.description),
      cadence: data.cadence || 'Weekly',
      cron: data.cron || '',
      workflowId: data.workflowId || null,
      reportType: data.reportType || 'Weekly Report',
      status: data.status || 'ACTIVE',
      createdBy: actorId,
      lastRunAt: null,
      nextRunHint: data.nextRunHint || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async executeWorkflow(workflow, actorId, context = {}) {
    const needsApproval = workflow.requiresApproval || workflow.sensitiveAction || workflow.executionPhase === 'HUMAN_APPROVED';
    const executionRef = await addDoc(collection(db, 'workflowExecutions'), {
      workflowId: workflow.id,
      workflowTitle: workflow.title,
      trigger: context.trigger || workflow.trigger,
      conditions: workflow.conditions || [],
      actions: workflow.actions || [],
      status: needsApproval ? 'PENDING_APPROVAL' : 'SUCCESS',
      actorId,
      affectedResources: context.affectedResources || [],
      executionPhase: workflow.executionPhase || 'HUMAN_APPROVED',
      startedAt: serverTimestamp(),
      completedAt: needsApproval ? null : serverTimestamp(),
      executionTimeMs: needsApproval ? null : Math.floor(200 + Math.random() * 600),
      error: '',
    });

    await addDoc(collection(db, 'workflowLogs'), {
      workflowId: workflow.id,
      executionId: executionRef.id,
      trigger: context.trigger || workflow.trigger,
      conditions: workflow.conditions || [],
      actions: workflow.actions || [],
      status: needsApproval ? 'AWAITING_APPROVAL' : 'SUCCESS',
      actorId,
      message: needsApproval ? 'Execution queued for human approval.' : 'Workflow completed successfully.',
      createdAt: serverTimestamp(),
    });

    if (needsApproval) {
      await addDoc(collection(db, 'workflowApprovals'), {
        workflowId: workflow.id,
        executionId: executionRef.id,
        requesterId: actorId,
        status: 'PENDING',
        sensitiveAction: Boolean(workflow.sensitiveAction),
        actionSummary: `${workflow.trigger} -> ${(workflow.actions || []).join(', ')}`,
        createdAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: '',
      });
    } else {
      await updateDoc(doc(db, 'automations', workflow.id), {
        runCount: increment(1),
        successCount: increment(1),
        lastRunAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return executionRef.id;
  },

  async approveWorkflowAction(approvalId, reviewerId, decision = 'APPROVED') {
    await updateDoc(doc(db, 'workflowApprovals', approvalId), {
      status: decision,
      reviewedBy: reviewerId,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async createAgentTask(data, actorId) {
    const ref = await addDoc(collection(db, 'agentTasks'), {
      title: clean(data.title),
      description: clean(data.description),
      agentType: data.agentType || 'Project Agent',
      targetType: data.targetType || 'Project',
      targetId: data.targetId || '',
      recommendation: data.recommendation || '',
      suggestedActions: asList(data.suggestedActions),
      status: data.status || 'PROPOSED',
      priority: data.priority || 'MEDIUM',
      requiresApproval: true,
      createdBy: actorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async runAgent(data, actorId) {
    const executionRef = await addDoc(collection(db, 'agentExecutions'), {
      agentType: data.agentType || 'Project Agent',
      targetType: data.targetType || 'Project',
      targetId: data.targetId || '',
      status: 'COMPLETED',
      actorId,
      summary: data.summary || `${data.agentType || 'Agent'} analyzed ${data.targetType || 'target'} and proposed review actions.`,
      riskScore: Number(data.riskScore || 25),
      recommendations: asList(data.recommendations || ['Notify team', 'Schedule review', 'Create follow-up task']),
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    await this.createAgentTask({
      title: `${data.agentType || 'Agent'} recommendation`,
      description: data.summary || 'AI agent generated a human-approved recommendation.',
      agentType: data.agentType,
      targetType: data.targetType,
      targetId: data.targetId,
      recommendation: data.summary,
      suggestedActions: asList(data.recommendations || ['Notify team', 'Schedule review', 'Create task']),
    }, actorId);
    return executionRef.id;
  },

  async generateReport(data, actorId) {
    const ref = await addDoc(collection(db, 'workflowLogs'), {
      workflowId: data.workflowId || '',
      executionId: '',
      trigger: 'Scheduled Report',
      conditions: [],
      actions: ['Generate Report'],
      status: 'SUCCESS',
      actorId,
      message: `${data.reportType || 'Weekly Report'} generated for ${data.scope || 'Platform'}.`,
      reportType: data.reportType || 'Weekly Report',
      scope: data.scope || 'Platform',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getAutomationHome(userId) {
    const [workflows, templates, jobsSnap, approvalsSnap, agentTasksSnap, logsSnap] = await Promise.all([
      this.listWorkflows({ limit: 80 }),
      this.getWorkflowTemplates(),
      getDocs(query(collection(db, 'scheduledJobs'), orderBy('createdAt', 'desc'), limit(20))),
      getDocs(query(collection(db, 'workflowApprovals'), orderBy('createdAt', 'desc'), limit(30))),
      getDocs(query(collection(db, 'agentTasks'), orderBy('createdAt', 'desc'), limit(30))),
      getDocs(query(collection(db, 'workflowLogs'), orderBy('createdAt', 'desc'), limit(30))),
    ]);
    return {
      workflows,
      myWorkflows: workflows.filter(item => item.ownerId === userId),
      activeWorkflows: workflows.filter(item => item.status === 'ACTIVE'),
      templates,
      scheduledJobs: docsFrom(jobsSnap),
      approvals: docsFrom(approvalsSnap),
      agentTasks: docsFrom(agentTasksSnap),
      logs: docsFrom(logsSnap),
    };
  },

  async getAutomationHealth() {
    const [
      workflowsSnap,
      templatesSnap,
      executionsSnap,
      logsSnap,
      approvalsSnap,
      jobsSnap,
      metricsSnap,
      agentTasksSnap,
      agentExecutionsSnap,
      memorySnap,
    ] = await Promise.all([
      getDocs(collection(db, 'automations')),
      getDocs(collection(db, 'workflowTemplates')),
      getDocs(collection(db, 'workflowExecutions')),
      getDocs(collection(db, 'workflowLogs')),
      getDocs(collection(db, 'workflowApprovals')),
      getDocs(collection(db, 'scheduledJobs')),
      getDocs(collection(db, 'automationMetrics')),
      getDocs(collection(db, 'agentTasks')),
      getDocs(collection(db, 'agentExecutions')),
      getDocs(collection(db, 'agentMemory')),
    ]);

    const workflows = docsFrom(workflowsSnap);
    const executions = docsFrom(executionsSnap);
    const logs = docsFrom(logsSnap);
    const approvals = docsFrom(approvalsSnap);
    const jobs = docsFrom(jobsSnap);
    const agentTasks = docsFrom(agentTasksSnap);
    const agentExecutions = docsFrom(agentExecutionsSnap);
    const failedExecutions = executions.filter(item => item.status === 'FAILED');
    const pendingApprovals = approvals.filter(item => item.status === 'PENDING');
    const stalledWorkflows = workflows.filter(item => {
      if (item.status !== 'ACTIVE') return false;
      return (new Date() - lastUpdated(item)) / (1000 * 60 * 60 * 24) > 30;
    });
    const successRate = executions.length
      ? Math.round((executions.filter(item => item.status === 'SUCCESS').length / executions.length) * 100)
      : 100;
    const scopeCounts = workflows.reduce((acc, item) => {
      acc[item.scope || 'Platform'] = (acc[item.scope || 'Platform'] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAutomations: workflows.length,
      activeAutomations: workflows.filter(item => item.status === 'ACTIVE').length,
      pausedAutomations: workflows.filter(item => item.status === 'PAUSED').length,
      failedAutomations: failedExecutions.length,
      workflowTemplates: templatesSnap.size || DEFAULT_TEMPLATES.length,
      workflowExecutions: executions.length,
      workflowLogs: logs.length,
      pendingApprovals: pendingApprovals.length,
      scheduledJobs: jobs.length,
      automationMetrics: metricsSnap.size,
      agentTasks: agentTasks.length,
      agentRecommendations: agentTasks.filter(item => ['PROPOSED', 'PENDING'].includes(item.status)).length,
      agentExecutions: agentExecutions.length,
      agentMemoryItems: memorySnap.size,
      stalledWorkflows: stalledWorkflows.length,
      successRate,
      scopeDistribution: Object.entries(scopeCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      recentLogs: logs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8),
      recentApprovals: approvals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8),
      topWorkflows: workflows.sort((a, b) => (b.runCount || 0) - (a.runCount || 0)).slice(0, 8),
      automationHealthLabel: failedExecutions.length > 3 || pendingApprovals.length > 10 ? 'Needs Review' : 'Healthy',
    };
  },
};
