import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './index.js';
import {
  users,
  accounts,
  tokens,
  transactions,
  defiPositions,
  alerts,
} from './schema.js';

async function seed() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const [user] = await db
    .insert(users)
    .values({
      email: 'demo@example.com',
      passwordHash,
    })
    .returning();

  if (!user) {
    throw new Error('Failed to create user');
  }

  const [acc1, acc2, acc3] = await db
    .insert(accounts)
    .values([
      {
        userId: user.id,
        name: 'Main Wallet',
        type: 'wallet',
        platform: 'MetaMask',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        baseCurrency: 'USD',
      },
      {
        userId: user.id,
        name: 'Binance Trading',
        type: 'exchange',
        platform: 'Binance',
        baseCurrency: 'USD',
      },
      {
        userId: user.id,
        name: 'Solana Wallet',
        type: 'wallet',
        platform: 'Phantom',
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        baseCurrency: 'USD',
      },
    ])
    .returning();

  if (!acc1 || !acc2 || !acc3) throw new Error('Failed to create accounts');

  await db.insert(tokens).values([
    { accountId: acc1.id, symbol: 'ETH', name: 'Ethereum', balance: 12.5, price: 3245.67, value: 40570.88, change24h: 2.34, chain: 'Ethereum' },
    { accountId: acc2.id, symbol: 'BTC', name: 'Bitcoin', balance: 0.85, price: 68950.32, value: 58607.77, change24h: -1.23, chain: 'Bitcoin' },
    { accountId: acc3.id, symbol: 'SOL', name: 'Solana', balance: 450, price: 142.56, value: 64152, change24h: 5.67, chain: 'Solana' },
    { accountId: acc1.id, symbol: 'USDC', name: 'USD Coin', balance: 15000, price: 1, value: 15000, change24h: 0.01, chain: 'Ethereum' },
  ]);

  await db.insert(transactions).values([
    { accountId: acc1.id, type: 'buy', tokenSymbol: 'ETH', amount: 2.5, price: 3200, value: 8000, fee: 15.5, timestamp: new Date('2026-03-12T08:30:00'), hash: '0x9f4e...' },
    { accountId: acc3.id, type: 'reward', tokenSymbol: 'SOL', amount: 12.5, price: 142.56, value: 1782, fee: 0, timestamp: new Date('2026-03-11T14:20:00') },
  ]);

  await db.insert(defiPositions).values([
    { accountId: acc1.id, protocol: 'Aave', type: 'lending', tokens: ['USDC'], invested: 10000, currentValue: 10425.5, apr: 4.25, rewards: 425.5, chain: 'Ethereum' },
    { accountId: acc1.id, protocol: 'Uniswap V3', type: 'liquidity', tokens: ['ETH', 'USDC'], invested: 8000, currentValue: 8645.2, apr: 12.8, rewards: 645.2, chain: 'Ethereum' },
  ]);

  await db.insert(alerts).values([
    { userId: user.id, type: 'price', title: 'ETH Price Alert', message: 'Ethereum reached your target price of $3,200', triggered: true, condition: 'ETH >= $3,200' },
    { userId: user.id, type: 'portfolio', title: 'Portfolio Milestone', message: 'Your total portfolio value exceeded $250,000', triggered: true, condition: 'Total Value >= $250,000' },
  ]);

  console.log('Seed complete. Demo user: demo@example.com / demo1234');
}

seed().catch(console.error);
