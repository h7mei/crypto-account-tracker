import {
  pgTable,
  uuid,
  text,
  timestamp,
  real,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const accountTypeEnum = pgEnum('account_type', [
  'wallet',
  'exchange',
  'manual',
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'buy',
  'sell',
  'swap',
  'transfer',
  'staking',
  'reward',
]);
export const defiTypeEnum = pgEnum('defi_type', [
  'staking',
  'liquidity',
  'lending',
  'borrowing',
  'farming',
]);
export const alertTypeEnum = pgEnum('alert_type', [
  'price',
  'portfolio',
  'transaction',
  'risk',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  platform: text('platform'),
  address: text('address'),
  baseCurrency: text('base_currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  balance: real('balance').notNull(),
  price: real('price').notNull(),
  value: real('value').notNull(),
  change24h: real('change_24h').notNull().default(0),
  chain: text('chain').notNull(),
  logo: text('logo'),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  amount: real('amount').notNull(),
  price: real('price').notNull(),
  value: real('value').notNull(),
  fee: real('fee').notNull().default(0),
  timestamp: timestamp('timestamp').notNull(),
  fromAddress: text('from_address'),
  toAddress: text('to_address'),
  hash: text('hash'),
});

export const defiPositions = pgTable('defi_positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  protocol: text('protocol').notNull(),
  type: defiTypeEnum('type').notNull(),
  tokens: jsonb('tokens').$type<string[]>().notNull(),
  invested: real('invested').notNull(),
  currentValue: real('current_value').notNull(),
  apr: real('apr').notNull().default(0),
  rewards: real('rewards').notNull().default(0),
  chain: text('chain').notNull(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: alertTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  triggered: boolean('triggered').notNull().default(false),
  condition: text('condition').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  baseCurrency: text('base_currency').default('USD'),
  timezone: text('timezone').default('UTC'),
  theme: text('theme').default('system'),
  dateFormat: text('date_format').default('MM/DD/YYYY'),
  priceAlertsEnabled: boolean('price_alerts_enabled').default(true),
  showPortfolioValue: boolean('show_portfolio_value').default(true),
  autoSyncEnabled: boolean('auto_sync_enabled').default(false),
  compactView: boolean('compact_view').default(true),
  showPercentageColors: boolean('show_percentage_colors').default(true),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  alerts: many(alerts),
  preferences: many(userPreferences),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users),
  tokens: many(tokens),
  transactions: many(transactions),
  defiPositions: many(defiPositions),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  account: one(accounts),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts),
}));

export const defiPositionsRelations = relations(defiPositions, ({ one }) => ({
  account: one(accounts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users),
}));
