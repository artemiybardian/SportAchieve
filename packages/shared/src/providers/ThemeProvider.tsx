import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

const THEME_USER_PICKED_KEY = 'sa_theme_user_picked';

function readUserPicked(): boolean {
  try {
    return localStorage.getItem(THEME_USER_PICKED_KEY) === '1';
  } catch {
    return false;
  }
}

function markUserPicked(): void {
  try {
    localStorage.setItem(THEME_USER_PICKED_KEY, '1');
  } catch {
    /* ignore */
  }
}

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  /** Только VK Mini App: применить схему клиента ВК, пока пользователь не нажал «тема» вручную. */
  applyVkClientScheme?: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggle: () => {} });

const STORAGE_KEY = 'sa_theme';

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore — приватный режим и др. */
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({
  children,
  vkClientSchemeSync = false,
}: {
  children: ReactNode;
  vkClientSchemeSync?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const userPickedRef = useRef(readUserPicked());

  const applyVkClientScheme = useCallback((isDark: boolean) => {
    if (userPickedRef.current || readUserPicked()) return;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => {
    userPickedRef.current = true;
    markUserPicked();
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextValue = vkClientSchemeSync
    ? { theme, toggle, applyVkClientScheme }
    : { theme, toggle };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
