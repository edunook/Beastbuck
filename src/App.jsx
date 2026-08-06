import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/Router';
import { AuthProvider } from './features/auth/AuthContext';
import { AIProvider } from './features/ai/AIProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AIProvider>
            <BrowserRouter>
              <AppRouter />
              <Toaster position="top-right" />
            </BrowserRouter>
          </AIProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
