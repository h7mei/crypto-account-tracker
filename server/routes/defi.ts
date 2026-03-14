import { Router, Response } from 'express';
type ExpressRouter = Router;
import { z } from 'zod';
import { db, defiPositions, accounts } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: ExpressRouter = Router();
router.use(authMiddleware);

const defiTypeEnum = z.enum([
  'staking',
  'liquidity',
  'lending',
  'borrowing',
  'farming',
]);

const createDefiSchema = z.object({
  accountId: z.string().uuid(),
  protocol: z.string().min(1),
  type: defiTypeEnum,
  tokens: z.array(z.string()),
  invested: z.number(),
  currentValue: z.number(),
  apr: z.number().default(0),
  rewards: z.number().default(0),
  chain: z.string().min(1),
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.query.accountId as string | undefined;

    const userAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, req.user!.id));

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) {
      return res.json([]);
    }

    if (accountId) {
      if (!accountIds.includes(accountId)) {
        return res.status(404).json({ error: 'Account not found' });
      }
      const rows = await db
        .select()
        .from(defiPositions)
        .where(eq(defiPositions.accountId, accountId));
      return res.json(
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
    }

    const rows = await db.select().from(defiPositions);
    const filtered = rows.filter((r) => accountIds.includes(r.accountId));

    res.json(
      filtered.map((r) => ({
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

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createDefiSchema.safeParse(req.body);
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
      .insert(defiPositions)
      .values({
        accountId: parsed.data.accountId,
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

export default router;
