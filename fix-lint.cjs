const fs = require('fs');

function replaceFile(path, search, replace) {
  if (!fs.existsSync(path)) {
    console.log("File not found:", path);
    return;
  }
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(path, content, 'utf8');
}

// Security
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/admin/AdminSecurity.jsx', 
  /const \{ icon: Icon, label, value, trend, color \} = stat;/, 
  'const { icon: Icon, label, value, trend } = stat;'
);

// Agents
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/agents/ApprovalCenter.jsx', 
  /const STATUS_MAP = \{[\s\S]*?\};\n/, 
  ''
);

// AI Creator
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/ai-creator/AIChatPage.jsx', 
  /const \{ aiId \} = useParams\(\);/, 
  'useParams();'
);

// AI
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/ai/AIOS.jsx', 
  /const openAssistant = \(id\) => \{[\s\S]*?\};\n/, 
  ''
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/ai/AIVentureAssistant.jsx', 
  /const \[messages, setMessages\] = useState\(/, 
  'const [messages] = useState('
);

// Auth
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/auth/AuthContext.jsx', 
  "const userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);\n", 
  ''
);

// Collab
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/collaboration/MeetingsCenter.jsx', 
  /const \{ user \} = useAuth\(\);/, 
  'useAuth();'
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/collaboration/WarRoomPage.jsx', 
  /const \{ user, roleData \} = useAuth\(\);/, 
  'const { user } = useAuth();'
);

// Dev
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/developer/APIKeysCenter.jsx', 
  /const \[keys, setKeys\] = useState\(/, 
  'const [keys] = useState('
);

// Events
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/events/EventDetail.jsx', 
  "const isLive = now >= start && now <= end;\n", 
  ''
);

// FunFlix
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/funflix/AIFunFlixAssistant.jsx', 
  /const \[messages, setMessages\] = useState\(/, 
  'const [messages] = useState('
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/funflix/MoviePlayer.jsx', 
  /const \{ movieId \} = useParams\(\);/, 
  'useParams();'
);

// Knowledge
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/knowledge/KnowledgeMap.jsx', 
  /const \[nodes, setNodes, onNodesChange\] = useNodesState\(initialNodes\);/, 
  'const [nodes, , onNodesChange] = useNodesState(initialNodes);'
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/knowledge/KnowledgeMap.jsx', 
  /const \[edges, setEdges, onEdgesChange\] = useEdgesState\(initialEdges\);/, 
  'const [edges, , onEdgesChange] = useEdgesState(initialEdges);'
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/knowledge/KnowledgeMap.jsx', 
  /nodes\.map\(\(n\) => \{/, 
  'nodes.map(() => {'
);

// Mission Control
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/mission-control/MemberAnalytics.jsx', 
  /const \{ icon: Icon, label, value, trend \} = stat;/, 
  'const { icon: Icon, label, value } = stat;'
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/mission-control/MemberAnalytics.jsx', 
  /topMembers\.map\(\(member, i\) => \(/, 
  'topMembers.map((member) => ('
);

// Workspace
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/digital-workspace/ResearchNotebookEditor.jsx', 
  /const ResearchNotebookEditor = \(\{ workspaceId, notebookId, onClose \}\) => \{/, 
  'const ResearchNotebookEditor = ({ notebookId }) => {'
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/digital-workspace/ResearchNotebookEditor.jsx', 
  /const \[notebook, setNotebook\] = useState\(null\);/, 
  ''
);
replaceFile('c:/Users/hp/Desktop/BeastBuck/src/features/digital-workspace/ResearchNotebookEditor.jsx', 
  /notebooks\.map\(\(nb, i\) => \(/, 
  'notebooks.map((nb) => ('
);

console.log('Done replacing unused vars');
