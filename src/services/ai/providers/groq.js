const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';
const TIMEOUT_MS = 30000; // 30 second timeout

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
            ...messages.map(message => ({ role: message.role, content: message.content })),
          ],
        }),
      });

      clearTimeout(timeoutId);

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Groq request failed.');
      return payload?.choices?.[0]?.message?.content || '';
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Groq request timed out. Please try again.', { cause: err });
      }
      throw err;
    }
  },
};
