import { Router, Response } from 'express';
import { z } from 'zod';
import { db, accounts, tokens, transactions, defiPositions } from '../db/index.js';
import { eq, and, asc, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();
router.use(authMiddleware);

const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['wallet', 'exchange', 'manual']),
  platform: z.string().optional(),
  address: z.string().optional(),
  baseCurrency: z.string().default('USD'),
});

const updateAccountSchema = createAccountSchema.partial();

const createTransactionSchema = z.object({
  type: z.enum(['buy', 'sell', 'swap', 'transfer', 'staking', 'reward']),
  tokenSymbol: z.string().min(1),
  amount: z.number(),
  price: z.number(),
  value: z.number(),
  fee: z.number().default(0),
  timestamp: z.coerce.date(),
  from: z.string().optional(),
  to: z.string().optional(),
  hash: z.string().optional(),
});

const createDefiSchema = z.object({
  protocol: z.string().min(1),
  type: z.enum(['staking', 'liquidity', 'lending', 'borrowing', 'farming']),
  tokens: z.array(z.string()),
  invested: z.number(),
  currentValue: z.number(),
  apr: z.number().default(0),
  rewards: z.number().default(0),
  chain: z.string().min(1),
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, req.user!.id))
      .orderBy(asc(accounts.createdAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        platform: r.platform ?? undefined,
        address: r.address ?? undefined,
        baseCurrency: r.baseCurrency,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error('Get accounts error:', err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Nested routes (must be before /:id)
router.get('/:id/holdings', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.params.id as string;
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rows = await db
      .select()
      .from(tokens)
      .where(eq(tokens.accountId, accountId));

    res.json(
      rows.map((r) => ({
        id: r.id,
        symbol: r.symbol,
        name: r.name,
        balance: r.balance,
        price: r.price,
        value: r.value,
        change24h: r.change24h,
        chain: r.chain,
        accountId: r.accountId,
        logo: r.logo ?? undefined,
      }))
    );
  } catch (err) {
    console.error('Get holdings error:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

router.get('/:id/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.params.id as string;
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.timestamp));

    res.json(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        tokenSymbol: r.tokenSymbol,
        amount: r.amount,
        price: r.price,
        value: r.value,
        fee: r.fee,
        accountId: r.accountId,
        timestamp: r.timestamp,
        from: r.fromAddress ?? undefined,
        to: r.toAddress ?? undefined,
        hash: r.hash ?? undefined,
      }))
    );
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/:id/defi-positions', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.params.id as string;
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rows = await db
      .select()
      .from(defiPositions)
      .where(eq(defiPositions.accountId, accountId));

    res.json(
      rows.map((r) => ({
        id: r.id,
        protocol: r.protocol,
        type: r.type,
        tokens: r.tokens,
        invested: r.invested,
        currentValue: r.currentValue,
        apr: r.apr,
        rewards: r.rewards,
        chain: r.chain,
        accountId: r.accountId,
      }))
    );
  } catch (err) {
    console.error('Get defi positions error:', err);
    res.status(500).json({ error: 'Failed to fetch DeFi positions' });
  }
});

router.post('/:id/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.params.id as string;
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .insert(transactions)
      .values({
        accountId,
        type: parsed.data.type,
        tokenSymbol: parsed.data.tokenSymbol,
        amount: parsed.data.amount,
        price: parsed.data.price,
        value: parsed.data.value,
        fee: parsed.data.fee,
        timestamp: parsed.data.timestamp,
        fromAddress: parsed.data.from,
        toAddress: parsed.data.to,
        hash: parsed.data.hash,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      type: row.type,
      tokenSymbol: row.tokenSymbol,
      amount: row.amount,
      price: row.price,
      value: row.value,
      fee: row.fee,
      accountId: row.accountId,
      timestamp: row.timestamp,
      from: row.fromAddress ?? undefined,
      to: row.toAddress ?? undefined,
      hash: row.hash ?? undefined,
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.post('/:id/defi-positions', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.params.id as string;
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const parsed = createDefiSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .insert(defiPositions)
      .values({
        accountId,
        protocol: parsed.data.protocol,
        type: parsed.data.type,
        tokens: parsed.data.tokens,
        invested: parsed.data.invested,
        currentValue: parsed.data.currentValue,
        apr: parsed.data.apr,
        rewards: parsed.data.rewards,
        chain: parsed.data.chain,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      protocol: row.protocol,
      type: row.type,
      tokens: row.tokens,
      invested: row.invested,
      currentValue: row.currentValue,
      apr: row.apr,
      rewards: row.rewards,
      chain: row.chain,
      accountId: row.accountId,
    });
  } catch (err) {
    console.error('Create defi position error:', err);
    res.status(500).json({ error: 'Failed to create DeFi position' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .insert(accounts)
      .values({
        userId: req.user!.id,
        name: parsed.data.name,
        type: parsed.data.type,
        platform: parsed.data.platform,
        address: parsed.data.address,
        baseCurrency: parsed.data.baseCurrency,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      name: row.name,
      type: row.type,
      platform: row.platform ?? undefined,
      address: row.address ?? undefined,
      baseCurrency: row.baseCurrency,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error('Create account error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [row] = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, req.params.id as string), eq(accounts.userId, req.user!.id))
      )
      .limit(1);

    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      id: row.id,
      name: row.name,
      type: row.type,
      platform: row.platform ?? undefined,
      address: row.address ?? undefined,
      baseCurrency: row.baseCurrency,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error('Get account error:', err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .update(accounts)
      .set(parsed.data)
      .where(
        and(eq(accounts.id, req.params.id as string), eq(accounts.userId, req.user!.id))
      )
      .returning();

    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      id: row.id,
      name: row.name,
      type: row.type,
      platform: row.platform ?? undefined,
      address: row.address ?? undefined,
      baseCurrency: row.baseCurrency,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error('Update account error:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [row] = await db
      .delete(accounts)
      .where(
        and(eq(accounts.id, req.params.id as string), eq(accounts.userId, req.user!.id))
      )
      .returning({ id: accounts.id });

    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
