import { Router, Response } from 'express';
import { db, tokens, defiPositions, accounts } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

type ExpressRouter = Router;
const router: ExpressRouter = Router();
router.use(authMiddleware);

router.get('/portfolio-value', async (req: AuthRequest, res: Response) => {
  try {
    const userAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, req.user!.id));

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) {
      return res.json({ totalValue: 0, holdingsValue: 0, defiValue: 0 });
    }

    const allTokens = await db.select().from(tokens);
    const allDefi = await db.select().from(defiPositions);

    const userTokens = allTokens.filter((t) => accountIds.includes(t.accountId));
    const userDefi = allDefi.filter((d) => accountIds.includes(d.accountId));

    const holdingsValue = userTokens.reduce((sum, t) => sum + t.value, 0);
    const defiValue = userDefi.reduce((sum, d) => sum + d.currentValue, 0);
    const totalValue = holdingsValue + defiValue;

    res.json({ totalValue, holdingsValue, defiValue });
  } catch (err) {
    console.error('Analytics portfolio-value error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio value' });
  }
});

router.get('/asset-allocation', async (req: AuthRequest, res: Response) => {
  try {
    const userAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, req.user!.id));

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) {
      return res.json({ byAsset: [], byChain: [] });
    }

    const allTokens = await db.select().from(tokens);
    const userTokens = allTokens.filter((t) => accountIds.includes(t.accountId));
    const total = userTokens.reduce((sum, t) => sum + t.value, 0);

    const byAssetMap = new Map<string, number>();
    const byChainMap = new Map<string, number>();

    for (const t of userTokens) {
      byAssetMap.set(t.symbol, (byAssetMap.get(t.symbol) ?? 0) + t.value);
      byChainMap.set(t.chain, (byChainMap.get(t.chain) ?? 0) + t.value);
    }

    const byAsset = Array.from(byAssetMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const byChain = Array.from(byChainMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    res.json({ byAsset, byChain });
  } catch (err) {
    console.error('Analytics asset-allocation error:', err);
    res.status(500).json({ error: 'Failed to fetch asset allocation' });
  }
});

export default router;
