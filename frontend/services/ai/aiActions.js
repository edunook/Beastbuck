export const AIActionsService = {
  // A simplistic regex to find a JSON block containing an "action" intent
  parseActions: (text) => {
    if (!text) return { plainText: '', actions: [] };

    const actions = [];
    let plainText = text;

    try {
      // Look for a markdown JSON block or raw JSON object
      // This is a naive implementation; in production a stronger structured output enforcement is preferred.
      const jsonRegex = /```json\n([\s\S]*?)\n```/g;
      
      let match;
      while ((match = jsonRegex.exec(text)) !== null) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed && parsed.action) {
            actions.push(parsed);
            plainText = plainText.replace(match[0], ''); // Remove the JSON block from visible text
          }
        } catch {
          // not valid JSON, ignore
        }
      }
    } catch (e) {
      console.error("Error parsing AI actions", e);
    }

    return { plainText: plainText.trim(), actions };
  },

  executeAction: async (action, context) => {
    // This is where we would map string actions to actual Firebase calls.
    // However, the user requires an Action Review Modal. 
    // This service only provides the schema definition for execution.
    // Actual execution is handled by the component layer interacting with the DB services.
    return true; 
  }
};
