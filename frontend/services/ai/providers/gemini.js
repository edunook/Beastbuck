const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.6-flash';
const API_VERSION = import.meta.env.VITE_GEMINI_API_VERSION || 'v1beta';
const MODEL_FALLBACKS = (import.meta.env.VITE_GEMINI_MODEL_FALLBACKS || 'gemini-3.6-flash,gemini-1.5-flash,gemini-1.5-pro').split(',').map(s => s.trim()).filter(Boolean);
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

    // Build request body once
    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: toGeminiMessages(messages),
    });

    // Build ordered list of models to try: configured model first, then fallbacks
    const modelsToTry = [MODEL, ...MODEL_FALLBACKS.filter(m => m !== MODEL)];

    // Build ordered list of API versions to try per model
    const versionsToTry = [API_VERSION];
    if (API_VERSION === 'v1') {
      versionsToTry.push('v1beta');
    } else {
      versionsToTry.push('v1');
    }

    let lastError = null;

    for (const model of modelsToTry) {
      for (const version of versionsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: requestBody,
            },
          );

          clearTimeout(timeoutId);

          const payload = await response.json();
          if (!response.ok) {
            const errorMsg = payload?.error?.message || `Gemini request failed with status ${response.status}`;
            // If model not found for this version, try next version/model
            if (errorMsg.includes('not found for API version') || response.status === 404) {
              lastError = new Error(errorMsg);
              continue;
            }
            // If rate limited (429), throw immediately - don't try other models
            if (response.status === 429) {
              throw new Error('Gemini API rate limit exceeded. Please try again in a few moments.');
            }
            throw new Error(errorMsg);
          }
          return payload?.candidates?.[0]?.content?.parts?.map(part => part.text).join('\n') || '';
        } catch (err) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            throw new Error('Gemini request timed out. Please try again.', { cause: err });
          }
          // If it's already a rate limit error, throw immediately
          if (err.message?.includes('rate limit')) {
            throw err;
          }
          lastError = err;
        }
      }
    }

    throw lastError || new Error('Gemini request failed.');
  },
};
