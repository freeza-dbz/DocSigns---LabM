import React, { Suspense } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  if (!theme) {
    return (
      <button
        className="p-2.5 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors duration-200"
        aria-label="Theme toggle loading"
        disabled
      >
        <Sun size={20} className="text-primary" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors duration-200 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun
          size={20}
          className="text-primary group-hover:scale-110 transition-transform duration-200"
        />
      ) : (
        <Moon
          size={20}
          className="text-primary group-hover:scale-110 transition-transform duration-200"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
