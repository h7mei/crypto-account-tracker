// Mock data for the Crypto Account Tracker

export interface Account {
  id: string;
  name: string;
  type: 'wallet' | 'exchange' | 'manual';
  platform?: string;
  address?: string;
  baseCurrency: string;
  createdAt: Date;
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
  timestamp: Date;
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
  createdAt: Date;
  condition: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

// Mock Accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Main Wallet',
    type: 'wallet',
    platform: 'MetaMask',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    baseCurrency: 'USD',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'acc-2',
    name: 'Binance Trading',
    type: 'exchange',
    platform: 'Binance',
    baseCurrency: 'USD',
    createdAt: new Date('2023-06-20')
  },
  {
    id: 'acc-3',
    name: 'Solana Wallet',
    type: 'wallet',
    platform: 'Phantom',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    baseCurrency: 'USD',
    createdAt: new Date('2024-03-01')
  }
];

// Mock Holdings
export const mockHoldings: Token[] = [
  {
    id: 'hold-1',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 12.5,
    price: 3245.67,
    value: 40570.88,
    change24h: 2.34,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'hold-2',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.85,
    price: 68950.32,
    value: 58607.77,
    change24h: -1.23,
    chain: 'Bitcoin',
    accountId: 'acc-2'
  },
  {
    id: 'hold-3',
    symbol: 'SOL',
    name: 'Solana',
    balance: 450,
    price: 142.56,
    value: 64152.00,
    change24h: 5.67,
    chain: 'Solana',
    accountId: 'acc-3'
  },
  {
    id: 'hold-4',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 15000,
    price: 1.00,
    value: 15000.00,
    change24h: 0.01,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'hold-5',
    symbol: 'MATIC',
    name: 'Polygon',
    balance: 8500,
    price: 0.89,
    value: 7565.00,
    change24h: 3.45,
    chain: 'Polygon',
    accountId: 'acc-1'
  },
  {
    id: 'hold-6',
    symbol: 'LINK',
    name: 'Chainlink',
    balance: 1200,
    price: 18.34,
    value: 22008.00,
    change24h: -0.89,
    chain: 'Ethereum',
    accountId: 'acc-2'
  },
  {
    id: 'hold-7',
    symbol: 'AVAX',
    name: 'Avalanche',
    balance: 320,
    price: 38.92,
    value: 12454.40,
    change24h: 4.12,
    chain: 'Avalanche',
    accountId: 'acc-2'
  },
  {
    id: 'hold-8',
    symbol: 'UNI',
    name: 'Uniswap',
    balance: 580,
    price: 11.24,
    value: 6519.20,
    change24h: 1.78,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'hold-9',
    symbol: 'AAVE',
    name: 'Aave',
    balance: 95,
    price: 164.50,
    value: 15627.50,
    change24h: -2.34,
    chain: 'Ethereum',
    accountId: 'acc-2'
  },
  {
    id: 'hold-10',
    symbol: 'DOT',
    name: 'Polkadot',
    balance: 1850,
    price: 7.89,
    value: 14596.50,
    change24h: 2.90,
    chain: 'Polkadot',
    accountId: 'acc-2'
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'buy',
    tokenSymbol: 'ETH',
    amount: 2.5,
    price: 3200.00,
    value: 8000.00,
    fee: 15.50,
    accountId: 'acc-1',
    timestamp: new Date('2026-03-12T08:30:00'),
    hash: '0x9f4e...'
  },
  {
    id: 'tx-2',
    type: 'reward',
    tokenSymbol: 'SOL',
    amount: 12.5,
    price: 142.56,
    value: 1782.00,
    fee: 0,
    accountId: 'acc-3',
    timestamp: new Date('2026-03-11T14:20:00')
  },
  {
    id: 'tx-3',
    type: 'swap',
    tokenSymbol: 'USDC',
    amount: -5000,
    price: 1.00,
    value: 5000.00,
    fee: 8.25,
    accountId: 'acc-1',
    timestamp: new Date('2026-03-11T09:15:00'),
    to: 'ETH'
  },
  {
    id: 'tx-4',
    type: 'sell',
    tokenSymbol: 'BTC',
    amount: -0.15,
    price: 68800.00,
    value: 10320.00,
    fee: 25.80,
    accountId: 'acc-2',
    timestamp: new Date('2026-03-10T16:45:00')
  },
  {
    id: 'tx-5',
    type: 'staking',
    tokenSymbol: 'MATIC',
    amount: 2000,
    price: 0.88,
    value: 1760.00,
    fee: 1.50,
    accountId: 'acc-1',
    timestamp: new Date('2026-03-10T11:30:00')
  },
  {
    id: 'tx-6',
    type: 'buy',
    tokenSymbol: 'LINK',
    amount: 500,
    price: 18.20,
    value: 9100.00,
    fee: 18.20,
    accountId: 'acc-2',
    timestamp: new Date('2026-03-09T13:00:00')
  },
  {
    id: 'tx-7',
    type: 'transfer',
    tokenSymbol: 'USDC',
    amount: 10000,
    price: 1.00,
    value: 10000.00,
    fee: 2.00,
    accountId: 'acc-1',
    timestamp: new Date('2026-03-08T10:20:00'),
    from: '0x742d...',
    to: '0x8a3f...'
  },
  {
    id: 'tx-8',
    type: 'buy',
    tokenSymbol: 'AVAX',
    amount: 150,
    price: 37.50,
    value: 5625.00,
    fee: 11.25,
    accountId: 'acc-2',
    timestamp: new Date('2026-03-07T15:40:00')
  },
  {
    id: 'tx-9',
    type: 'swap',
    tokenSymbol: 'ETH',
    amount: -1.5,
    price: 3150.00,
    value: 4725.00,
    fee: 12.50,
    accountId: 'acc-1',
    timestamp: new Date('2026-03-06T09:30:00'),
    to: 'UNI'
  },
  {
    id: 'tx-10',
    type: 'reward',
    tokenSymbol: 'AAVE',
    amount: 5.5,
    price: 162.00,
    value: 891.00,
    fee: 0,
    accountId: 'acc-2',
    timestamp: new Date('2026-03-05T12:00:00')
  }
];

// Mock DeFi Positions
export const mockDefiPositions: DeFiPosition[] = [
  {
    id: 'defi-1',
    protocol: 'Aave',
    type: 'lending',
    tokens: ['USDC'],
    invested: 10000,
    currentValue: 10425.50,
    apr: 4.25,
    rewards: 425.50,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'defi-2',
    protocol: 'Uniswap V3',
    type: 'liquidity',
    tokens: ['ETH', 'USDC'],
    invested: 8000,
    currentValue: 8645.20,
    apr: 12.8,
    rewards: 645.20,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'defi-3',
    protocol: 'Lido',
    type: 'staking',
    tokens: ['ETH'],
    invested: 15000,
    currentValue: 15780.25,
    apr: 5.2,
    rewards: 780.25,
    chain: 'Ethereum',
    accountId: 'acc-1'
  },
  {
    id: 'defi-4',
    protocol: 'Marinade',
    type: 'staking',
    tokens: ['SOL'],
    invested: 12000,
    currentValue: 12890.00,
    apr: 7.4,
    rewards: 890.00,
    chain: 'Solana',
    accountId: 'acc-3'
  },
  {
    id: 'defi-5',
    protocol: 'Curve',
    type: 'farming',
    tokens: ['USDC', 'USDT', 'DAI'],
    invested: 20000,
    currentValue: 20560.80,
    apr: 8.9,
    rewards: 560.80,
    chain: 'Ethereum',
    accountId: 'acc-2'
  },
  {
    id: 'defi-6',
    protocol: 'Compound',
    type: 'lending',
    tokens: ['USDC'],
    invested: 5000,
    currentValue: 5156.75,
    apr: 3.1,
    rewards: 156.75,
    chain: 'Ethereum',
    accountId: 'acc-2'
  }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'price',
    title: 'ETH Price Alert',
    message: 'Ethereum reached your target price of $3,200',
    triggered: true,
    createdAt: new Date('2026-03-12T08:25:00'),
    condition: 'ETH >= $3,200'
  },
  {
    id: 'alert-2',
    type: 'portfolio',
    title: 'Portfolio Milestone',
    message: 'Your total portfolio value exceeded $250,000',
    triggered: true,
    createdAt: new Date('2026-03-11T15:30:00'),
    condition: 'Total Value >= $250,000'
  },
  {
    id: 'alert-3',
    type: 'transaction',
    title: 'Large Transaction',
    message: 'Large transfer detected: 10,000 USDC',
    triggered: true,
    createdAt: new Date('2026-03-08T10:20:00'),
    condition: 'Transfer >= $10,000'
  },
  {
    id: 'alert-4',
    type: 'price',
    title: 'SOL Price Alert',
    message: 'Waiting for Solana to reach $150',
    triggered: false,
    createdAt: new Date('2026-03-01T12:00:00'),
    condition: 'SOL >= $150'
  },
  {
    id: 'alert-5',
    type: 'risk',
    title: 'High Volatility Warning',
    message: 'BTC volatility increased by 35% in 24h',
    triggered: true,
    createdAt: new Date('2026-03-10T18:00:00'),
    condition: 'Volatility > 30%'
  }
];

// Mock Historical Portfolio Data (30 days)
export const mockPortfolioHistory = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseValue = 220000;
  const variation = Math.sin(i / 5) * 15000 + Math.random() * 8000;
  return {
    timestamp: date.getTime(),
    value: baseValue + variation
  };
});

// Mock Price History for ETH (7 days)
export const mockEthPriceHistory: PriceHistory[] = Array.from({ length: 168 }, (_, i) => {
  const date = new Date();
  date.setHours(date.getHours() - (167 - i));
  const basePrice = 3200;
  const variation = Math.sin(i / 12) * 120 + Math.random() * 80;
  return {
    timestamp: date.getTime(),
    price: basePrice + variation
  };
});

// Calculate total portfolio value
export const getTotalPortfolioValue = (): number => {
  const holdingsValue = mockHoldings.reduce((sum, token) => sum + token.value, 0);
  const defiValue = mockDefiPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
  return holdingsValue + defiValue;
};

// Calculate total PnL
export const getTotalPnL = (): { amount: number; percentage: number } => {
  const currentValue = getTotalPortfolioValue();
  const invested = 245000; // Mock invested amount
  const amount = currentValue - invested;
  const percentage = (amount / invested) * 100;
  return { amount, percentage };
};

// Get portfolio allocation by asset
export const getAssetAllocation = () => {
  const total = mockHoldings.reduce((sum, token) => sum + token.value, 0);
  const allocation = mockHoldings.map(token => ({
    name: token.symbol,
    value: token.value,
    percentage: (token.value / total) * 100
  }));
  return allocation.sort((a, b) => b.value - a.value);
};

// Get portfolio allocation by chain
export const getChainAllocation = () => {
  const chainValues: { [key: string]: number } = {};
  mockHoldings.forEach(token => {
    chainValues[token.chain] = (chainValues[token.chain] || 0) + token.value;
  });
  
  const total = Object.values(chainValues).reduce((sum, val) => sum + val, 0);
  return Object.entries(chainValues).map(([name, value]) => ({
    name,
    value,
    percentage: (value / total) * 100
  })).sort((a, b) => b.value - a.value);
};

// Get top gainers and losers
export const getTopMovers = () => {
  const sorted = [...mockHoldings].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
  return {
    gainers: sorted.filter(t => t.change24h > 0).slice(0, 3),
    losers: sorted.filter(t => t.change24h < 0).slice(0, 3)
  };
};
