import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('tips-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // This ensures the native browser date picker popup matches the theme
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('tips-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};