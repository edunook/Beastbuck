import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AIService } from '@services/ai/aiService';
import { AIChatHistoryService } from '@services/ai/aiChatHistory';
import { AIContextBuilder } from '@services/ai/aiContextBuilder';
import { AIActionsService } from '@services/ai/aiActions';
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
  const [providerId, setProviderId] = useState('groq');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      const s = await AIChatHistoryService.getSessions(user.uid);
      setSessions(s);
      if (s.length > 0 && !activeSessionId) {
        setActiveSessionId(s[0].id);
      }
    } catch (err) {
      setSessions([]);
    }
  };

  const loadMessages = async (sid) => {
    try {
      const msgs = await AIChatHistoryService.getSessionMessages(sid);
      setMessages(msgs);
    } catch (err) {
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    try {
      const sid = await AIChatHistoryService.createSession(user.uid, 'New Conversation');
      setActiveSessionId(sid);
      await loadSessions();
    } catch (err) {
    }
  };

  const deleteSession = async (sid) => {
    try {
      await AIChatHistoryService.deleteSession(sid);
      if (activeSessionId === sid) setActiveSessionId(null);
      await loadSessions();
    } catch (err) {
    }
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
    try {
      await AIChatHistoryService.addMessageToSession(activeSessionId, 'user', text);
    } catch (err) {
    }

    setLoading(true);
    try {
      // Build permission-aware context
      const systemContext = await AIContextBuilder.buildFullContext(user, roleData, pageContext);

      const responseText = await AIService.chat({
        providerId,
        mode,
        messages: [...messages, userMsg],
        knowledge: [{ title: 'System Permissions Context', content: systemContext }]
      });

      // Parse for actions
      const { plainText, actions } = AIActionsService.parseActions(responseText);

      // Add AI message
      const aiMsg = { role: 'assistant', content: plainText };
      setMessages(prev => [...prev, aiMsg]);
      try {
        await AIChatHistoryService.addMessageToSession(activeSessionId, 'assistant', plainText);
      } catch (err) {
      }

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
    try {
      await AIChatHistoryService.addMessageToSession(activeSessionId, 'assistant', msg.content);
    } catch (err) {
    }
  };

  const handleActionCancel = () => {
    setStagedAction(null);
  };

  const value = {
    isOpen,
    isMinimized,
    mode,
    providerId,
    setProviderId,
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
