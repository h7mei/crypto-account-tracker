import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY_PREFIX = 'crypto-tracker-selected-wallet';

interface SelectedWalletContextType {
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  clearSelection: () => void;
}

const SelectedWalletContext = createContext<SelectedWalletContextType | undefined>(undefined);

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

export function SelectedWalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(null);

  const setSelectedAccountId = useCallback(
    (id: string | null) => {
      setSelectedAccountIdState(id);
      if (user) {
        const key = getStorageKey(user.id);
        if (id) {
          localStorage.setItem(key, id);
        } else {
          localStorage.removeItem(key);
        }
      }
    },
    [user]
  );

  const clearSelection = useCallback(() => {
    setSelectedAccountIdState(null);
    if (user) {
      localStorage.removeItem(getStorageKey(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSelectedAccountIdState(null);
      return;
    }
    const key = getStorageKey(user.id);
    const stored = localStorage.getItem(key);
    if (stored) {
      setSelectedAccountIdState(stored);
    }
  }, [user?.id]);

  return (
    <SelectedWalletContext.Provider
      value={{ selectedAccountId, setSelectedAccountId, clearSelection }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
}

export function useSelectedWallet() {
  const context = useContext(SelectedWalletContext);
  if (context === undefined) {
    throw new Error('useSelectedWallet must be used within a SelectedWalletProvider');
  }
  return context;
}
