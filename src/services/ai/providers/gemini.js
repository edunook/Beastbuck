const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-pro';
const TIMEOUT_MS = 30000; // 30 second timeout

function toGeminiMessages(messages) {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

export const geminiProvider = {
  id: 'gemini',
  name: 'Gemini',
  configured: Boolean(API_KEY),

  async chat({ messages, systemPrompt, signal }) {
    if (!API_KEY) throw new Error('Gemini API key is not configured.');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Merge external signal with timeout signal
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: toGeminiMessages(messages),
          }),
        },
      );

      clearTimeout(timeoutId);

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Gemini request failed.');
      return payload?.candidates?.[0]?.content?.parts?.map(part => part.text).join('\n') || '';
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Gemini request timed out. Please try again.', { cause: err });
      }
      throw err;
    }
  },
};
