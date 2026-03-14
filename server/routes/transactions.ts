import { Router, Response } from 'express';
type ExpressRouter = Router;
import { z } from 'zod';
import { db, transactions, accounts } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: ExpressRouter = Router();
router.use(authMiddleware);

const txTypeEnum = z.enum([
  'buy',
  'sell',
  'swap',
  'transfer',
  'staking',
  'reward',
]);

const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  type: txTypeEnum,
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
        .from(transactions)
        .where(eq(transactions.accountId, accountId))
        .orderBy(desc(transactions.timestamp));
      return res.json(
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
    }

    const rows = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.timestamp));
    const filtered = rows.filter((r) => accountIds.includes(r.accountId));

    res.json(
      filtered.map((r) => ({
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

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
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
      .insert(transactions)
      .values({
        accountId: parsed.data.accountId,
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

export default router;
