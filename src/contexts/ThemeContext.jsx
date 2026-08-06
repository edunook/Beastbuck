import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [systemTheme, setSystemTheme] = useState('dark');

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('beastbuck-theme');
    if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const applyTheme = useCallback((themeValue) => {
    const effectiveTheme = themeValue === 'system' ? systemTheme : themeValue;
    const root = document.documentElement;
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [systemTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, systemTheme, applyTheme]);

  const setTheme = useCallback((newTheme) => {
    if (['dark', 'light', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('beastbuck-theme', newTheme);
    }
  }, []);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, systemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
