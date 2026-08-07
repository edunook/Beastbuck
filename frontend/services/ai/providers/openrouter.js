const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemma-2-9b-it:free';
const TIMEOUT_MS = 30000; // 30 second timeout

export const openrouterProvider = {
  id: 'openrouter',
  name: 'OpenRouter',
  configured: Boolean(API_KEY),

  async chat({ messages, systemPrompt, signal }) {
    if (!API_KEY) throw new Error('OpenRouter API key is not configured.');

    console.log('[AI] Attempting provider: OpenRouter...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      console.log(`[AI] Trying OpenRouter model: ${MODEL}`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BeastBuck AI OS',
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
      if (!response.ok) {
        console.log(`[AI] OpenRouter request failed: ${payload?.error?.message || 'OpenRouter request failed.'}`);
        throw new Error(payload?.error?.message || 'OpenRouter request failed.');
      }
      console.log(`[AI] OpenRouter request successful with model: ${MODEL}`);
      return payload?.choices?.[0]?.message?.content || '';
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.log('[AI] OpenRouter request timed out');
        throw new Error('OpenRouter request timed out. Please try again.', { cause: err });
      }
      console.log(`[AI] OpenRouter provider failed: ${err.message}`);
      throw err;
    }
  },
};
