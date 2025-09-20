import React, { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';

const STORAGE_KEY = 'theme-preference';
const FULL_WIDTH_ROUTES = new Set(['/']);

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const Layout = ({ children }) => {
  const location = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.has(location.pathname);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const nextClass = theme === 'dark' ? 'theme-dark' : 'theme-light';
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(nextClass);
    document.body.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const themeContextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className="app-wrapper">
        <NavMenu />
        <main className="content">
          {isFullWidth ? (
            <div className="page-full">{children}</div>
          ) : (
            <Container className="page-shell">{children}</Container>
          )}
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
};
