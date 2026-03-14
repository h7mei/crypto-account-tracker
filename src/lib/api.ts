const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  register: (email: string, password: string) =>
    api<{ user: { id: string; email: string }; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    api<{ user: { id: string; email: string }; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () =>
    api<{ user: { id: string; email: string } }>('/api/auth/me'),
};

export interface UserPreferences {
  baseCurrency: string;
  timezone: string;
  theme: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  priceAlertsEnabled: boolean;
  showPortfolioValue: boolean;
  autoSyncEnabled: boolean;
  compactView: boolean;
  showPercentageColors: boolean;
}

export const preferencesApi = {
  get: () => api<UserPreferences>('/api/preferences'),
  update: (data: Partial<UserPreferences>) =>
    api<UserPreferences>('/api/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const accountsApi = {
  list: () => api<Account[]>('/api/accounts'),
  get: (id: string) => api<Account>(`/api/accounts/${id}`),
  create: (data: CreateAccount) => api<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateAccount>) =>
    api<Account>(`/api/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

export const tokensApi = {
  list: (accountId?: string) =>
    api<Token[]>(accountId ? `/api/tokens?accountId=${accountId}` : '/api/tokens/all'),
  create: (data: CreateToken) =>
    api<Token>('/api/tokens', { method: 'POST', body: JSON.stringify(data) }),
};

export const transactionsApi = {
  list: (accountId?: string) =>
    api<Transaction[]>(
      accountId ? `/api/transactions?accountId=${accountId}` : '/api/transactions'
    ),
  create: (data: CreateTransaction) =>
    api<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
};

export const defiApi = {
  list: (accountId?: string) =>
    api<DeFiPosition[]>(
      accountId ? `/api/defi?accountId=${accountId}` : '/api/defi'
    ),
  create: (data: CreateDefi) =>
    api<DeFiPosition>('/api/defi', { method: 'POST', body: JSON.stringify(data) }),
};

export const analyticsApi = {
  portfolioValue: () =>
    api<{ totalValue: number; holdingsValue: number; defiValue: number }>(
      '/api/analytics/portfolio-value'
    ),
  assetAllocation: () =>
    api<{
      byAsset: { name: string; value: number; percentage: number }[];
      byChain: { name: string; value: number; percentage: number }[];
    }>('/api/analytics/asset-allocation'),
};

export const alertsApi = {
  list: () => api<Alert[]>(`/api/alerts`),
  create: (data: CreateAlert) =>
    api<Alert>('/api/alerts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateAlert>) =>
    api<Alert>(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    api<void>(`/api/alerts/${id}`, { method: 'DELETE' }),
};

export interface Account {
  id: string;
  name: string;
  type: 'wallet' | 'exchange' | 'manual';
  platform?: string;
  address?: string;
  baseCurrency: string;
  createdAt: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  chain: string;
  accountId: string;
  logo?: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'swap' | 'transfer' | 'staking' | 'reward';
  tokenSymbol: string;
  amount: number;
  price: number;
  value: number;
  fee: number;
  accountId: string;
  timestamp: string;
  from?: string;
  to?: string;
  hash?: string;
}

export interface DeFiPosition {
  id: string;
  protocol: string;
  type: 'staking' | 'liquidity' | 'lending' | 'borrowing' | 'farming';
  tokens: string[];
  invested: number;
  currentValue: number;
  apr: number;
  rewards: number;
  chain: string;
  accountId: string;
}

export interface Alert {
  id: string;
  type: 'price' | 'portfolio' | 'transaction' | 'risk';
  title: string;
  message: string;
  triggered: boolean;
  condition: string;
  createdAt: string;
}

export interface CreateAccount {
  name: string;
  type: 'wallet' | 'exchange' | 'manual';
  platform?: string;
  address?: string;
  baseCurrency?: string;
}

export interface CreateToken {
  accountId: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h?: number;
  chain: string;
  logo?: string;
}

export interface CreateTransaction {
  accountId: string;
  type: 'buy' | 'sell' | 'swap' | 'transfer' | 'staking' | 'reward';
  tokenSymbol: string;
  amount: number;
  price: number;
  value: number;
  fee?: number;
  timestamp: string | Date;
  from?: string;
  to?: string;
  hash?: string;
}

export interface CreateDefi {
  accountId: string;
  protocol: string;
  type: 'staking' | 'liquidity' | 'lending' | 'borrowing' | 'farming';
  tokens: string[];
  invested: number;
  currentValue: number;
  apr?: number;
  rewards?: number;
  chain: string;
}

export interface CreateAlert {
  type: 'price' | 'portfolio' | 'transaction' | 'risk';
  title: string;
  message: string;
  condition: string;
  triggered?: boolean;
}
