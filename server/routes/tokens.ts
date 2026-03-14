import { Router, Response } from 'express';
type ExpressRouter = Router;
import { z } from 'zod';
import { db, tokens, accounts } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: ExpressRouter = Router();
router.use(authMiddleware);

const createTokenSchema = z.object({
  accountId: z.string().uuid(),
  symbol: z.string().min(1),
  name: z.string().min(1),
  balance: z.number(),
  price: z.number(),
  value: z.number(),
  change24h: z.number().default(0),
  chain: z.string().min(1),
  logo: z.string().optional(),
});

const updateTokenSchema = createTokenSchema.partial().omit({ accountId: true });

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId query param required' });
    }

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
    console.error('Get tokens error:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

router.get('/all', async (req: AuthRequest, res: Response) => {
  try {
    const userAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, req.user!.id));

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) {
      return res.json([]);
    }

    const rows = await db.select().from(tokens);
    const filtered = rows.filter((r) => accountIds.includes(r.accountId));

    res.json(
      filtered.map((r) => ({
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
    console.error('Get all tokens error:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, parsed.data.accountId),
          eq(accounts.userId, req.user!.id)
        )
      )
      .limit(1);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [row] = await db
      .insert(tokens)
      .values({
        accountId: parsed.data.accountId,
        symbol: parsed.data.symbol,
        name: parsed.data.name,
        balance: parsed.data.balance,
        price: parsed.data.price,
        value: parsed.data.value,
        change24h: parsed.data.change24h,
        chain: parsed.data.chain,
        logo: parsed.data.logo,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      balance: row.balance,
      price: row.price,
      value: row.value,
      change24h: row.change24h,
      chain: row.chain,
      accountId: row.accountId,
      logo: row.logo ?? undefined,
    });
  } catch (err) {
    console.error('Create token error:', err);
    res.status(500).json({ error: 'Failed to create holding' });
  }
});

export default router;
