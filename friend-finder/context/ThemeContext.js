import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

const defaultLight = {
  background: '#ffffff',
  surface: '#f2f3f5',
  text: '#0b1b2b',
  muted: '#6b7280',
  accent: '#2563eb'
};

const defaultDark = {
  background: '#071028',
  surface: '#0f1724',
  text: '#e6eef8',
  muted: '#9aa6b2',
  accent: '#e19d41'
};

const ThemeContext = createContext({ theme: defaultLight, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(defaultLight);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (raw) {
          const val = raw === 'dark';
          setIsDark(val);
          setTheme(val ? defaultDark : defaultLight);
        }
      } catch (e) {
        console.log('Theme load err', e);
      }
    })();
  }, []);

  useEffect(() => {
    setTheme(isDark ? defaultDark : defaultLight);
    AsyncStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light').catch(() => {});
  }, [isDark]);

  function toggle() {
    setIsDark(v => !v);
  }

  return <ThemeContext.Provider value={{ theme, isDark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
