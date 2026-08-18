const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';
const TIMEOUT_MS = 30000; // 30 second timeout
const MAX_MESSAGE_CHARS = 15000; // ~3750 tokens, keeps requests under free-tier TPM limit

// Import OpenRouter for fallback
let openrouterProvider = null;
async function getOpenRouterFallback() {
  if (!openrouterProvider) {
    const module = await import('./openrouter.js');
    openrouterProvider = module.openrouterProvider;
  }
  return openrouterProvider;
}

function truncateMessages(messages) {
  if (messages.length <= 4) return messages;
  const tail = messages.slice(-4);
  const head = messages.slice(0, messages.length - 4);
  const truncatedHead = head.map(m => ({
    ...m,
    content: m.content.length > MAX_MESSAGE_CHARS / head.length
      ? m.content.slice(0, Math.floor(MAX_MESSAGE_CHARS / head.length)) + '...'
      : m.content,
  }));
  return [...truncatedHead, ...tail];
}

export const groqProvider = {
  id: 'groq',
  name: 'Groq',
  configured: Boolean(API_KEY),

  async chat({ messages, systemPrompt, signal }) {
    if (!API_KEY) throw new Error('Groq API key is not configured.');


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...truncateMessages(messages.map(message => ({ role: message.role, content: message.content }))),
          ],
        }),
      });

      clearTimeout(timeoutId);

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Groq request failed.');
      }
      return payload?.choices?.[0]?.message?.content || '';
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Groq request timed out. Please try again.', { cause: err });
      }
      
      // Fallback to OpenRouter if Groq fails
      console.warn('Groq request failed, falling back to OpenRouter:', err.message);
      try {
        const fallback = await getOpenRouterFallback();
        if (fallback.configured) {
          return await fallback.chat({ messages, systemPrompt, signal });
        }
      } catch (fallbackErr) {
        console.error('OpenRouter fallback also failed:', fallbackErr);
      }
      
      throw err;
    }
  },
};
