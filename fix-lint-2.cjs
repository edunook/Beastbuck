const fs = require('fs');

function replace(file, search, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replaceStr);
  fs.writeFileSync(file, content);
}

replace('c:/Users/hp/Desktop/BeastBuck/src/features/ai/AIOS.jsx', 
  'const openAssistant = (id) => {', 
  'const _openAssistant = (id) => {');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/auth/AuthContext.jsx', 
  'const userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);', 
  '// eslint-disable-next-line no-unused-vars\nconst userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/digital-workspace/ResearchNotebookEditor.jsx', 
  'const ResearchNotebookEditor = ({ workspaceId, notebookId, onClose }) => {', 
  'const ResearchNotebookEditor = ({ notebookId }) => {');
replace('c:/Users/hp/Desktop/BeastBuck/src/features/digital-workspace/ResearchNotebookEditor.jsx', 
  'notebooks.map((nb, i) => (', 
  'notebooks.map((nb) => (');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/events/EventDetail.jsx', 
  'const isLive = now >= start && now <= end;', 
  '');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/intelligence/AIExecutiveAdvisor.jsx', 
  '} catch (err) {', 
  '} catch {');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/knowledge/KnowledgeMap.jsx', 
  'nodes.map((n) => {', 
  'nodes.map(() => {');

replace('c:/Users/hp/Desktop/BeastBuck/src/features/mission-control/MemberAnalytics.jsx', 
  'const { icon: Icon, label, value, trend } = stat;', 
  'const { icon: Icon, label, value } = stat;');
replace('c:/Users/hp/Desktop/BeastBuck/src/features/mission-control/MemberAnalytics.jsx', 
  'topMembers.map((member, i) => (', 
  'topMembers.map((member) => (');
