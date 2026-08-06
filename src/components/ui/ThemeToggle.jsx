import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-lg transition-all duration-200 ${
            theme === value
              ? 'bg-accent text-black shadow-lg shadow-accent/30'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};
