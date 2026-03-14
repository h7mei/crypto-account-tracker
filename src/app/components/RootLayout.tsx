import { Outlet, Link } from 'react-router';
import { Wallet, Plus, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSelectedWallet } from '../context/SelectedWalletContext';
import { useAccounts } from '@/hooks/useAccounts';

export function RootLayout() {
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { data: accounts } = useAccounts();
  const { selectedAccountId, setSelectedAccountId, clearSelection } = useSelectedWallet();

  useEffect(() => {
    if (accounts.length > 0 && selectedAccountId && !accounts.find((a) => a.id === selectedAccountId)) {
      clearSelection();
    }
  }, [accounts, selectedAccountId, clearSelection]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 min-w-0">
            <Link to="/" className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 hidden sm:block">
                <h1 className="font-semibold text-foreground truncate">Crypto Tracker</h1>
                <p className="text-xs text-muted-foreground truncate" title={user?.email ?? 'Portfolio Management'}>
                  {user?.email ?? 'Portfolio Management'}
                </p>
              </div>
            </Link>

            <div className="relative shrink-0">
              {accounts.length === 0 ? (
                <Link
                  to="/settings?add=1"
                  className="flex items-center gap-2 px-4 py-2 rounded border border-border bg-background hover:bg-accent text-foreground min-w-[180px] justify-between"
                >
                  <span className="truncate">No wallets</span>
                  <Plus className="w-4 h-4 shrink-0" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setWalletDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-2 rounded border border-border bg-background hover:bg-accent text-foreground min-w-[180px] justify-between"
                    aria-haspopup="listbox"
                    aria-expanded={walletDropdownOpen}
                  >
                    <span className="truncate">
                      {selectedAccountId
                        ? accounts.find((a) => a.id === selectedAccountId)?.name ?? 'Select wallet...'
                        : 'Select wallet...'}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </button>
                  {walletDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        aria-hidden
                        onClick={() => setWalletDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-50 min-w-[220px] py-1 bg-card border border-border rounded-lg shadow-lg">
                        <button
                          onClick={() => {
                            setSelectedAccountId(null);
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent text-muted-foreground"
                        >
                          Select wallet...
                        </button>
                        {accounts.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              setSelectedAccountId(acc.id);
                              setWalletDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent ${
                              selectedAccountId === acc.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                            }`}
                          >
                            <Wallet className="w-4 h-4 shrink-0" />
                            <span className="truncate">{acc.name}</span>
                          </button>
                        ))}
                        <div className="border-t border-border my-1" />
                        <Link
                          to="/settings"
                          onClick={() => setWalletDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent text-muted-foreground"
                        >
                          <Plus className="w-4 h-4" />
                          Add wallet
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}