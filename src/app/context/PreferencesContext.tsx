import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { preferencesApi, type UserPreferences } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime, formatShortDateTime, formatShortDate } from '@/lib/format';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'crypto-tracker-preferences';

const defaults: UserPreferences = {
  baseCurrency: 'USD',
  timezone: 'UTC',
  theme: 'system',
  dateFormat: 'MM/DD/YYYY',
  priceAlertsEnabled: true,
  showPortfolioValue: true,
  autoSyncEnabled: false,
  compactView: true,
  showPercentageColors: true,
};

function loadFromStorage(): UserPreferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function saveToStorage(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences to localStorage', e);
  }
}

interface PreferencesContextType extends UserPreferences {
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(loadFromStorage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(loadFromStorage());
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    preferencesApi
      .get()
      .then((prefs) => {
        if (!cancelled) {
          setPreferences({ ...defaults, ...prefs });
          saveToStorage({ ...defaults, ...prefs });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreferences(loadFromStorage());
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const next = { ...preferences, ...updates };
      setPreferences(next);
      saveToStorage(next);
      if (user) {
        try {
          const synced = await preferencesApi.update(updates);
          setPreferences((p) => ({ ...p, ...synced }));
          saveToStorage({ ...next, ...synced });
        } catch (e) {
          console.error('Failed to sync preferences to server', e);
        }
      }
    },
    [preferences, user]
  );

  return (
    <PreferencesContext.Provider
      value={{ ...preferences, updatePreferences, isLoading }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export function useFormat() {
  const { baseCurrency, dateFormat, timezone } = usePreferences();
  return useMemo(
    () => ({
      formatCurrency: (value: number, opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) =>
        formatCurrency(value, baseCurrency, opts),
      formatDate: (date: Date | string) => formatDate(date, dateFormat, timezone),
      formatDateTime: (date: Date | string) => formatDateTime(date, dateFormat, timezone),
      formatShortDateTime: (date: Date | string) => formatShortDateTime(date, timezone),
      formatShortDate: (date: Date | string) => formatShortDate(date, timezone),
    }),
    [baseCurrency, dateFormat, timezone]
  );
}
