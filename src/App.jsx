import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/Router';
import { AuthProvider } from './features/auth/AuthContext';
import { AIProvider } from './features/ai/AIProvider';

function App() {
  return (
    <AuthProvider>
      <AIProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AIProvider>
    </AuthProvider>
  );
}

export default App;
