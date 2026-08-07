import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { geminiProvider } from './providers/gemini';
import { groqProvider } from './providers/groq';
import { openrouterProvider } from './providers/openrouter';

export const AI_MODES = {
  general: {
    label: 'General Chat',
    systemPrompt: 'You are BeastBuck AI OS, a concise, safe, kid-friendly assistant for a young creator company.',
  },
  coding: {
    label: 'Coding Help',
    systemPrompt: 'You are BeastBuck Coding Agent. Help debug, explain code, and propose careful implementation steps.',
  },
  learning: {
    label: 'Learning Help',
    systemPrompt: 'You are BeastBuck Learning Agent. Explain concepts clearly, ask good questions, and create quizzes when helpful.',
  },
  experiment: {
    label: 'Experiment Help',
    systemPrompt: 'You are BeastBuck Experiment Assistant. Suggest safe experiment ideas, science fair ideas, materials, procedures, and result notes.',
  },
  project: {
    label: 'Project Help',
    systemPrompt: 'You are BeastBuck Project Agent. Help plan projects, assign milestones, identify risks, and track progress.',
  },
};

export const FUTURE_AGENTS = [
  { id: 'research', name: 'Research Agent', purpose: 'Collects sources, summarizes findings, and builds research briefs.' },
  { id: 'learning', name: 'Learning Agent', purpose: 'Creates study plans, quizzes, explanations, and skill practice.' },
  { id: 'coding', name: 'Coding Agent', purpose: 'Reviews code, explains bugs, and helps implement features.' },
  { id: 'project', name: 'Project Agent', purpose: 'Tracks milestones, blockers, assignments, and delivery notes.' },
];

const providers = {
  gemini: geminiProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
};

const PROVIDER_FALLBACK_ORDER = ['groq', 'openrouter', 'gemini'];
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
const MAX_SYSTEM_PROMPT_CHARS = 6000; // Safe cap for free-tier providers (~1500 tokens)

function isNonRetryableError(err) {
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('not found for api version') ||
    msg.includes('is not found') ||
    (msg.includes('invalid') && msg.includes('api key')) ||
    msg.includes('api key is not configured') ||
    msg.includes('request too large') ||
    msg.includes('content too large') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  );
}

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (isNonRetryableError(err)) throw err;
      if (i === retries - 1) throw err;
      const delay = RETRY_DELAYS[i] || 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

function buildSystemPrompt(mode, knowledge = []) {
  const basePrompt = AI_MODES[mode]?.systemPrompt || AI_MODES.general.systemPrompt;

  let knowledgeText = '';
  if (knowledge.length > 0) {
    const fullKnowledge = knowledge.map(item => item.content).join('\n\n');
    if (fullKnowledge.length > MAX_SYSTEM_PROMPT_CHARS) {
      knowledgeText = fullKnowledge.slice(0, MAX_SYSTEM_PROMPT_CHARS) + '\n\n[Context truncated due to size limits]';
    } else {
      knowledgeText = fullKnowledge;
    }
  }

  return [basePrompt, 'Use BeastBuck organization knowledge when relevant.', knowledgeText].filter(Boolean).join('\n\n');
}

function localReply({ messages, mode, knowledge = [] }) {
  const latest = messages[messages.length - 1]?.content || '';
  const label = AI_MODES[mode]?.label || AI_MODES.general.label;

  // Check if user is asking about their information
  const lowerLatest = latest.toLowerCase();
  if (lowerLatest.includes('information about me') || lowerLatest.includes('what do you know about me') || lowerLatest.includes('my data') || lowerLatest.includes('my profile')) {
    if (knowledge.length > 0 && knowledge[0].content) {
      return `Based on your profile data:\n\n${knowledge[0].content.substring(0, 500)}...`;
    }
  }

  if (mode === 'learning') {
    return `Local ${label}: Here is a quick study path for "${latest}".\n\n1. Define the key idea in one sentence.\n2. Work one example.\n3. Try a 3-question quiz.\n\nQuiz:\n- What is the main concept?\n- Where would you use it?\n- What is one mistake to avoid?`;
  }

  if (mode === 'experiment') {
    return `Local ${label}: For "${latest}", try a safe experiment plan:\n\n- Question: What do you want to test?\n- Materials: Use simple household or classroom-safe items.\n- Procedure: Change one variable at a time.\n- Results: Record photos, measurements, and observations.\n- Lesson: Explain what changed and why.`;
  }

  if (mode === 'coding') {
    return `Local ${label}: I can help with "${latest}". Share the file, error, or expected behavior, then check:\n\n- What changed recently?\n- What exact error appears?\n- Can the issue be reproduced in a small case?`;
  }

  if (mode === 'project') {
    return `Local ${label}: Turn "${latest}" into a project board:\n\n- Goal\n- Owner\n- 3 milestones\n- Risks\n- Next action\n\nStart with the smallest visible deliverable.`;
  }

  return `Local ${label}: I am ready. Ask for learning help, coding help, experiment ideas, project planning, quizzes, or summaries.`;
}

export const AIService = {
  providers,

  getProviders() {
    return Object.values(providers).map(({ id, name, configured }) => ({ id, name, configured }));
  },

  async chat({ providerId = 'local', mode = 'general', messages = [], knowledge = [], signal }) {
    const systemPrompt = buildSystemPrompt(mode, knowledge);

    // If local mode, return local reply
    if (providerId === 'local') {
      return localReply({ messages, mode, knowledge });
    }

    // Get provider priority order
    let providerOrder = PROVIDER_FALLBACK_ORDER;

    // If specific provider requested, try it first, then fallback
    const selectedProviderId = providerId;
    if (providerId && providers[providerId]) {
      providerOrder = [providerId, ...PROVIDER_FALLBACK_ORDER.filter(p => p !== providerId)];
    }

    // Filter to configured providers only, but preserve explicitly selected provider
    const configuredProviders = providerOrder.filter(id => {
      if (id === selectedProviderId) return true;
      return providers[id]?.configured;
    });

    if (configuredProviders.length === 0) {
      console.warn('[AI] No configured providers available');
      return localReply({ messages, mode });
    }

    // Try each provider with retry logic
    for (const providerId of configuredProviders) {
      const provider = providers[providerId];

      try {
        const result = await retryWithBackoff(async () => {
          return await provider.chat({ messages, systemPrompt, signal });
        });
        return result;
      } catch (err) {
        console.warn(`[AI] Provider ${provider.name} failed:`, err.message);
        // Continue to next provider
      }
    }

    // All providers failed
    console.error('[AI] All providers failed');
    return localReply({ messages, mode, knowledge });
  },

  async describeImage({ providerId = 'local', mode = 'general', imageName, prompt }) {
    const messages = [{
      role: 'user',
      content: `Vision request for image "${imageName}". Task: ${prompt || 'Describe the image, extract visible text if present, and discuss notable objects.'}`,
    }];
    return this.chat({ providerId, mode, messages });
  },

  async saveKnowledge({ title, content, category = 'general', createdBy }) {
    const docRef = await addDoc(collection(db, 'aiKnowledge'), {
      title: String(title || '').trim(),
      content: String(content || '').trim(),
      category,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getKnowledge(maxCount = 25) {
    const snap = await getDocs(query(collection(db, 'aiKnowledge'), orderBy('createdAt', 'desc'), limit(maxCount)));
    return snap.docs.map(item => ({ id: item.id, ...item.data() }));
  },
};
