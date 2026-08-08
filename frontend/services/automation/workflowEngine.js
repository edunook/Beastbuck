/**
 * BeastBuck Workflow Automation Engine
 * Core service for AI agents, triggers, conditions, and workflow orchestration.
 */

// ---------------------------------------------------------------------------
// 1. AGENT TEMPLATES
// ---------------------------------------------------------------------------
export const AGENT_TYPES = [
  { id: 'research', name: 'Research Agent', icon: '🔬', description: 'Automates literature collection, citation suggestions, and research summaries.' },
  { id: 'venture', name: 'Venture Agent', icon: '🚀', description: 'Tracks progress, monitors milestones, and generates venture reports.' },
  { id: 'marketplace', name: 'Marketplace Agent', icon: '🏪', description: 'Optimizes listings, monitors trends, and analyzes creator reputation.' },
  { id: 'learning', name: 'Learning Agent', icon: '📚', description: 'Recommends courses, generates study plans, and tracks learning progress.' },
  { id: 'mentor', name: 'Mentor Agent', icon: '🧑‍🏫', description: 'Matches mentors with mentees and schedules check-ins.' },
  { id: 'community', name: 'Community Agent', icon: '🌐', description: 'Monitors community health, detects sentiment shifts, and sends alerts.' },
  { id: 'governance', name: 'Governance Agent', icon: '⚖️', description: 'Summarizes proposals, generates voting reports, and tracks governance analytics.' },
  { id: 'analytics', name: 'Analytics Agent', icon: '📊', description: 'Generates dashboards, detects anomalies, and produces operational insights.' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Coordinates cross-team workflows, manages task queues, and optimizes resources.' },
  { id: 'collaboration', name: 'Collaboration Agent', icon: '🤝', description: 'Creates meeting summaries, extracts action items, and organizes workspaces.' },
  { id: 'knowledge', name: 'Knowledge Agent', icon: '🧠', description: 'Links articles, detects citations, and updates the knowledge graph.' },
];

// ---------------------------------------------------------------------------
// 2. TRIGGER TYPES
// ---------------------------------------------------------------------------
export const TRIGGER_TYPES = [
  { id: 'schedule', label: 'Scheduled', description: 'Run on a recurring schedule (hourly, daily, weekly).' },
  { id: 'event', label: 'Event-Based', description: 'Triggered when a specific event occurs (e.g., new member joins).' },
  { id: 'threshold', label: 'Threshold', description: 'Fires when a metric crosses a defined threshold.' },
  { id: 'manual', label: 'Manual', description: 'Triggered manually by a user or admin.' },
  { id: 'webhook', label: 'Webhook', description: 'Triggered by an external webhook call.' },
  { id: 'condition', label: 'Conditional', description: 'Fires when a complex condition evaluates to true.' },
];

// ---------------------------------------------------------------------------
// 3. ACTION TYPES
// ---------------------------------------------------------------------------
export const ACTION_TYPES = [
  { id: 'notify', label: 'Send Notification', icon: '🔔' },
  { id: 'email', label: 'Send Email', icon: '📧' },
  { id: 'create_task', label: 'Create Task', icon: '📋' },
  { id: 'update_record', label: 'Update Record', icon: '📝' },
  { id: 'generate_report', label: 'Generate Report', icon: '📊' },
  { id: 'assign_badge', label: 'Assign Badge', icon: '🏅' },
  { id: 'create_alert', label: 'Create Alert', icon: '🚨' },
  { id: 'ai_analysis', label: 'Run AI Analysis', icon: '🤖' },
  { id: 'webhook_call', label: 'Call Webhook', icon: '🌐' },
  { id: 'approval_request', label: 'Request Approval', icon: '✅' },
];

// ---------------------------------------------------------------------------
// 4. WORKFLOW ENGINE
// ---------------------------------------------------------------------------
export const WorkflowEngine = {
  /**
   * Evaluates a trigger condition against current data.
   */
  evaluateTrigger(trigger, context) {
    switch (trigger.type) {
      case 'threshold':
        return context.value >= trigger.threshold;
      case 'condition':
        return trigger.conditions.every(c => this._evaluateCondition(c, context));
      case 'schedule':
        return true; // Scheduler handles timing externally
      case 'event':
        return context.eventType === trigger.eventType;
      case 'manual':
        return true;
      default:
        return false;
    }
  },

  _evaluateCondition(condition, context) {
    const value = context[condition.field];
    switch (condition.operator) {
      case 'eq': return value === condition.value;
      case 'neq': return value !== condition.value;
      case 'gt': return value > condition.value;
      case 'lt': return value < condition.value;
      case 'gte': return value >= condition.value;
      case 'lte': return value <= condition.value;
      case 'contains': return String(value).includes(condition.value);
      default: return false;
    }
  },

  /**
   * Executes a workflow by processing each step sequentially.
   */
  async executeWorkflow(workflow) {
    const execution = {
      workflowId: workflow.id,
      startedAt: new Date().toISOString(),
      status: 'running',
      steps: [],
      logs: [],
    };

    for (const step of workflow.steps) {
      const stepResult = {
        stepId: step.id,
        action: step.action,
        startedAt: new Date().toISOString(),
        status: 'pending',
      };

      try {
        // Check if step requires approval
        if (step.requiresApproval) {
          stepResult.status = 'awaiting_approval';
          stepResult.message = 'Human approval required before proceeding.';
          execution.steps.push(stepResult);
          execution.status = 'awaiting_approval';
          execution.logs.push(`[${new Date().toISOString()}] Step "${step.name}" requires human approval.`);
          break;
        }

        // Simulate action execution
        stepResult.status = 'completed';
        stepResult.completedAt = new Date().toISOString();
        execution.logs.push(`[${new Date().toISOString()}] Step "${step.name}" completed successfully.`);
      } catch (error) {
        stepResult.status = 'failed';
        stepResult.error = error.message;
        execution.logs.push(`[${new Date().toISOString()}] Step "${step.name}" failed: ${error.message}`);

        if (step.retryCount && step.retryCount > 0) {
          execution.logs.push(`[${new Date().toISOString()}] Retrying step "${step.name}"...`);
          step.retryCount--;
        } else {
          execution.status = 'failed';
          execution.steps.push(stepResult);
          break;
        }
      }

      execution.steps.push(stepResult);
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
    }

    execution.completedAt = new Date().toISOString();
    return execution;
  },

  /**
   * Creates a new agent instance from a template.
   */
  createAgent(template, config) {
    return {
      id: `agent_${Date.now()}`,
      templateId: template.id,
      name: config.name || template.name,
      type: template.id,
      icon: template.icon,
      status: 'idle',
      createdAt: new Date().toISOString(),
      config: {
        triggers: config.triggers || [],
        actions: config.actions || [],
        schedule: config.schedule || null,
        requiresApproval: config.requiresApproval ?? false,
      },
      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalTimeSavedMinutes: 0,
        lastExecutedAt: null,
      },
      memories: [],
    };
  },

  /**
   * Fetches active agents from Firestore for dashboard display.
   */
  async getActiveAgents() {
    try {
      const { getDocs, query, collection, where } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const agentsRef = collection(db, 'automation_agents');
      const q = query(agentsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Failed to fetch active agents:', error);
      return [];
    }
  },

  /**
   * Fetches workflow templates from Firestore for the marketplace.
   */
  async getWorkflowTemplates() {
    try {
      const { getDocs, query, collection, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const templatesRef = collection(db, 'workflow_templates');
      const q = query(templatesRef, orderBy('installs', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Failed to fetch workflow templates:', error);
      return [];
    }
  },

  /**
   * Fetches recommendations from Firestore for the RecommendationEngine.
   */
  async getRecommendations(userId) {
    try {
      const { getDocs, query, collection, where } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const recommendationsRef = collection(db, 'automation_recommendations');
      const q = query(
        recommendationsRef,
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  },
};
