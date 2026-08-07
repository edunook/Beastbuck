import { BrowserRouter } from 'react-router-dom';
import AppRouter from '@frontend/routes/Router';
import { AuthProvider } from '@frontend/features/auth/AuthContext';
import { AIProvider } from '@frontend/features/ai/AIProvider';
import { ThemeProvider } from '@frontend/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@frontend/components/ErrorBoundary';

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
