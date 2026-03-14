import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { usePreferences } from '@/app/context/PreferencesContext';
import { formatDate } from '@/lib/format';
import { Wallet, Plus, Globe, Lock, Settings as SettingsIcon, Trash2, Edit, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { AddAccountModal } from '@/app/components/AddAccountModal';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
] as const;

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: 'EST (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'PST (GMT-8)' },
  { value: 'Europe/Paris', label: 'CET (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'JST (GMT+9)' },
  { value: 'Asia/Jakarta', label: 'WIB (GMT+7)' },
] as const;

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY' as const, label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD' },
] as const;

export function Settings() {
  const { data: accounts } = useAccounts();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    baseCurrency,
    timezone,
    dateFormat,
    priceAlertsEnabled,
    showPortfolioValue,
    autoSyncEnabled,
    compactView,
    showPercentageColors,
    updatePreferences,
  } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'accounts' | 'preferences' | 'security'>('accounts');
  const [addAccountOpen, setAddAccountOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setAddAccountOpen(true);
      setActiveTab('accounts');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your accounts, preferences, and security</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-4 border-b-2 transition-colors ${
              activeTab === 'accounts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Accounts</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Preferences</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Security</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Connected Accounts</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage your wallets and exchange connections</p>
            </div>
            <button
              onClick={() => setAddAccountOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Account
            </button>
          </div>

          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-card rounded border border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-primary to-[#1E40AF] flex items-center justify-center text-white">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{account.name}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                          {account.type}
                        </span>
                      </div>
                      {account.platform && (
                        <p className="text-sm text-muted-foreground mb-1">{account.platform}</p>
                      )}
                      {account.address && (
                        <p className="text-sm text-muted-foreground font-mono">{account.address}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {formatDate(account.createdAt, dateFormat, timezone)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-accent rounded transition-colors">
                      <Edit className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-[#F23645]/10 rounded transition-colors">
                      <Trash2 className="w-5 h-5 text-[#F23645]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Account Options */}
          <div className="bg-accent rounded border border-border p-6">
            <h4 className="font-semibold text-foreground mb-4">Add New Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setAddAccountOpen(true)}
                className="p-4 bg-card border border-border rounded hover:border-primary/50 hover:shadow-sm transition-all text-left"
              >
                <div className="text-primary mb-2">
                  <Wallet className="w-8 h-8" />
                </div>
                <div className="font-medium text-foreground mb-1">Connect Wallet</div>
                <div className="text-sm text-muted-foreground">Add wallet by address (EVM, Solana)</div>
              </button>
              <button
                disabled
                className="p-4 bg-card border border-border rounded opacity-60 cursor-not-allowed text-left"
              >
                <div className="text-[#9C27B0] mb-2">
                  <Globe className="w-8 h-8" />
                </div>
                <div className="font-medium text-foreground mb-1">Exchange API</div>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </button>
              <button
                onClick={() => setAddAccountOpen(true)}
                className="p-4 bg-card border border-border rounded hover:border-primary/50 hover:shadow-sm transition-all text-left"
              >
                <div className="text-[#089981] mb-2">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="font-medium text-foreground mb-1">Manual Entry</div>
                <div className="text-sm text-muted-foreground">Add holdings manually</div>
              </button>
            </div>
          </div>

          <AddAccountModal open={addAccountOpen} onClose={() => setAddAccountOpen(false)} />
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">General Preferences</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Base Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => updatePreferences({ baseCurrency: e.target.value })}
                  className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => updatePreferences({ timezone: e.target.value })}
                  className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {TIMEZONE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => updatePreferences({ dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })}
                  className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {DATE_FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary rounded"
                    checked={priceAlertsEnabled}
                    onChange={(e) => updatePreferences({ priceAlertsEnabled: e.target.checked })}
                  />
                  <span className="text-sm text-foreground">Enable price alerts notifications</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary rounded"
                    checked={showPortfolioValue}
                    onChange={(e) => updatePreferences({ showPortfolioValue: e.target.checked })}
                  />
                  <span className="text-sm text-foreground">Show portfolio value on dashboard</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary rounded"
                    checked={autoSyncEnabled}
                    onChange={(e) => updatePreferences({ autoSyncEnabled: e.target.checked })}
                  />
                  <span className="text-sm text-foreground">Enable automatic portfolio syncing</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Display Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                </label>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded text-foreground hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="capitalize">{theme}</span>
                </button>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary rounded"
                    checked={compactView}
                    onChange={(e) => updatePreferences({ compactView: e.target.checked })}
                  />
                  <span className="text-sm text-foreground">Compact view</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary rounded"
                    checked={showPercentageColors}
                    onChange={(e) => updatePreferences({ showPercentageColors: e.target.checked })}
                  />
                  <span className="text-sm text-foreground">Show percentage changes with colors</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-foreground">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-foreground">API Key Encryption</div>
                    <div className="text-sm text-muted-foreground mt-1">All API keys are encrypted and stored securely</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-[#089981]/10 text-[#089981]">
                    Active
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-foreground">Read-Only Wallet Connections</div>
                    <div className="text-sm text-muted-foreground mt-1">Wallet connections are read-only by default</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-[#089981]/10 text-[#089981]">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-6">Access Logs</h3>
            <div className="space-y-3">
              {[
                { date: 'Mar 12, 2026 08:30 AM', action: 'Login', ip: '192.168.1.1', location: 'New York, US' },
                { date: 'Mar 11, 2026 02:15 PM', action: 'Portfolio sync', ip: '192.168.1.1', location: 'New York, US' },
                { date: 'Mar 10, 2026 11:45 AM', action: 'Account added', ip: '192.168.1.1', location: 'New York, US' },
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-accent rounded">
                  <div>
                    <div className="font-medium text-foreground">{log.action}</div>
                    <div className="text-sm text-muted-foreground mt-1">{log.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{log.location}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Session</h3>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="bg-[#F23645]/10 border border-[#F23645]/20 rounded p-6">
            <h3 className="font-semibold text-[#F23645] mb-2">Danger Zone</h3>
            <p className="text-sm text-foreground mb-4">These actions are irreversible. Please proceed with caution.</p>
            <div className="space-y-3">
              <button className="w-full md:w-auto px-4 py-2 border border-[#F23645] text-[#F23645] rounded hover:bg-[#F23645]/10 transition-colors">
                Clear All Data
              </button>
              <button className="w-full md:w-auto px-4 py-2 ml-0 md:ml-3 bg-[#F23645] text-white rounded hover:bg-[#D32F2F] transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
