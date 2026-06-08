import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AIService } from '../../services/ai/aiService';
import { AIChatHistoryService } from '../../services/ai/aiChatHistory';
import { AIContextBuilder } from '../../services/ai/aiContextBuilder';
import { AIActionsService } from '../../services/ai/aiActions';
import ActionReviewModal from './ActionReviewModal';
import GlobalAIAssistant from './GlobalAIAssistant';

const AIContext = createContext();

export function useAI() {
  return useContext(AIContext);
}

export function AIProvider({ children }) {
  const { user, roleData } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState('general');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Page context state
  const [pageContext, setPageContext] = useState(null);

  // Staged action for ActionReviewModal
  const [stagedAction, setStagedAction] = useState(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    if (!user) return;
    const s = await AIChatHistoryService.getSessions(user.uid);
    setSessions(s);
    if (s.length > 0 && !activeSessionId) {
      setActiveSessionId(s[0].id);
    }
  };

  const loadMessages = async (sid) => {
    const msgs = await AIChatHistoryService.getSessionMessages(sid);
    setMessages(msgs);
  };

  const createNewSession = async () => {
    const sid = await AIChatHistoryService.createSession(user.uid, 'New Conversation');
    setActiveSessionId(sid);
    await loadSessions();
  };

  const deleteSession = async (sid) => {
    await AIChatHistoryService.deleteSession(sid);
    if (activeSessionId === sid) setActiveSessionId(null);
    await loadSessions();
  };

  const openAssistant = (overrideMode = 'general', contextData = null) => {
    setMode(overrideMode);
    if (contextData) setPageContext(contextData);
    setIsOpen(true);
    setIsMinimized(false);
    if (!activeSessionId && sessions.length === 0) {
      createNewSession();
    }
  };

  const closeAssistant = () => setIsOpen(false);
  const toggleMinimize = () => setIsMinimized(prev => !prev);

  const sendMessage = async (text) => {
    if (!text.trim() || !activeSessionId) return;
    
    // Add User message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    await AIChatHistoryService.addMessageToSession(activeSessionId, 'user', text);
    
    setLoading(true);
    try {
      // Build permission-aware context
      const systemContext = await AIContextBuilder.buildFullContext(user, roleData, pageContext);
      
      const responseText = await AIService.chat({
        providerId: 'groq', // Primary provider, will fallback to openrouter then gemini
        mode,
        messages: [...messages, userMsg],
        knowledge: [{ title: 'System Permissions Context', content: systemContext }]
      });

      // Parse for actions
      const { plainText, actions } = AIActionsService.parseActions(responseText);

      // Add AI message
      const aiMsg = { role: 'assistant', content: plainText };
      setMessages(prev => [...prev, aiMsg]);
      await AIChatHistoryService.addMessageToSession(activeSessionId, 'assistant', plainText);

      // Stage action if one exists
      if (actions && actions.length > 0) {
        setStagedAction(actions[0]);
      }
      
    } catch (err) {
      console.error(err);
      const errMsg = { role: 'assistant', content: `Error: ${err.message}` };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!stagedAction) return;
    // Execute action
    await AIActionsService.executeAction(stagedAction, pageContext);
    setStagedAction(null);
    
    const msg = { role: 'assistant', content: `_Action "${stagedAction.action}" executed successfully._` };
    setMessages(prev => [...prev, msg]);
    await AIChatHistoryService.addMessageToSession(activeSessionId, 'assistant', msg.content);
  };

  const handleActionCancel = () => {
    setStagedAction(null);
  };

  const value = {
    isOpen,
    isMinimized,
    mode,
    sessions,
    activeSessionId,
    messages,
    loading,
    openAssistant,
    closeAssistant,
    toggleMinimize,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    sendMessage,
    setPageContext
  };

  return (
    <AIContext.Provider value={value}>
      {children}
      {user && isOpen && <GlobalAIAssistant />}
      {stagedAction && (
        <ActionReviewModal 
          action={stagedAction} 
          onConfirm={handleActionConfirm} 
          onCancel={handleActionCancel} 
        />
      )}
    </AIContext.Provider>
  );
}
