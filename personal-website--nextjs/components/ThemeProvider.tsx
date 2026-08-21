"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'network' | 'rdr2' | 'lis' | 'cyberpunk' | 'sifu' | 'cozy' | 'ocean' | 'forest' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  consentGiven: boolean | null; // null means not answered yet
  setConsent: (consent: boolean) => void;
  themes: Theme[];
}

const themes: Theme[] = ['network', 'rdr2', 'lis', 'cyberpunk', 'sifu', 'cozy', 'ocean', 'forest', 'light', 'dark'];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('network');
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasConsent = localStorage.getItem('themeConsent');
    if (hasConsent !== null) {
      setConsentGiven(hasConsent === 'true');
    }
    
    if (hasConsent === 'true') {
      const savedTheme = localStorage.getItem('userTheme') as Theme;
      if (savedTheme && themes.includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (consentGiven) {
      localStorage.setItem('userTheme', newTheme);
    }
  };

  const setConsent = (consent: boolean) => {
    setConsentGiven(consent);
    localStorage.setItem('themeConsent', consent.toString());
    if (consent) {
      localStorage.setItem('userTheme', theme);
    } else {
      localStorage.removeItem('userTheme');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, consentGiven, setConsent, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
