import { Router, Response } from 'express';
import { z } from 'zod';
import { db, userPreferences } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();
router.use(authMiddleware);

const updatePreferencesSchema = z.object({
  baseCurrency: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  priceAlertsEnabled: z.boolean().optional(),
  showPortfolioValue: z.boolean().optional(),
  autoSyncEnabled: z.boolean().optional(),
  compactView: z.boolean().optional(),
  showPercentageColors: z.boolean().optional(),
});

const defaults = {
  baseCurrency: 'USD',
  timezone: 'UTC',
  theme: 'system',
  dateFormat: 'MM/DD/YYYY' as const,
  priceAlertsEnabled: true,
  showPortfolioValue: true,
  autoSyncEnabled: false,
  compactView: true,
  showPercentageColors: true,
};

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [row] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (!row) {
      const [inserted] = await db
        .insert(userPreferences)
        .values({ userId, ...defaults })
        .returning();

      return res.json({
        baseCurrency: inserted!.baseCurrency ?? defaults.baseCurrency,
        timezone: inserted!.timezone ?? defaults.timezone,
        theme: inserted!.theme ?? defaults.theme,
        dateFormat: inserted!.dateFormat ?? defaults.dateFormat,
        priceAlertsEnabled: inserted!.priceAlertsEnabled ?? defaults.priceAlertsEnabled,
        showPortfolioValue: inserted!.showPortfolioValue ?? defaults.showPortfolioValue,
        autoSyncEnabled: inserted!.autoSyncEnabled ?? defaults.autoSyncEnabled,
        compactView: inserted!.compactView ?? defaults.compactView,
        showPercentageColors: inserted!.showPercentageColors ?? defaults.showPercentageColors,
      });
    }

    res.json({
      baseCurrency: row.baseCurrency ?? defaults.baseCurrency,
      timezone: row.timezone ?? defaults.timezone,
      theme: row.theme ?? defaults.theme,
      dateFormat: row.dateFormat ?? defaults.dateFormat,
      priceAlertsEnabled: row.priceAlertsEnabled ?? defaults.priceAlertsEnabled,
      showPortfolioValue: row.showPortfolioValue ?? defaults.showPortfolioValue,
      autoSyncEnabled: row.autoSyncEnabled ?? defaults.autoSyncEnabled,
      compactView: row.compactView ?? defaults.compactView,
      showPercentageColors: row.showPercentageColors ?? defaults.showPercentageColors,
    });
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.patch('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updatePreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const userId = req.user!.id;
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    const updates = parsed.data;
    const updatePayload: Record<string, unknown> = {};
    if (updates.baseCurrency !== undefined) updatePayload.baseCurrency = updates.baseCurrency;
    if (updates.timezone !== undefined) updatePayload.timezone = updates.timezone;
    if (updates.theme !== undefined) updatePayload.theme = updates.theme;
    if (updates.dateFormat !== undefined) updatePayload.dateFormat = updates.dateFormat;
    if (updates.priceAlertsEnabled !== undefined) updatePayload.priceAlertsEnabled = updates.priceAlertsEnabled;
    if (updates.showPortfolioValue !== undefined) updatePayload.showPortfolioValue = updates.showPortfolioValue;
    if (updates.autoSyncEnabled !== undefined) updatePayload.autoSyncEnabled = updates.autoSyncEnabled;
    if (updates.compactView !== undefined) updatePayload.compactView = updates.compactView;
    if (updates.showPercentageColors !== undefined) updatePayload.showPercentageColors = updates.showPercentageColors;

    if (Object.keys(updatePayload).length === 0) {
      const r = existing;
      return res.json({
        baseCurrency: r?.baseCurrency ?? defaults.baseCurrency,
        timezone: r?.timezone ?? defaults.timezone,
        theme: r?.theme ?? defaults.theme,
        dateFormat: (r?.dateFormat as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') ?? defaults.dateFormat,
        priceAlertsEnabled: r?.priceAlertsEnabled ?? defaults.priceAlertsEnabled,
        showPortfolioValue: r?.showPortfolioValue ?? defaults.showPortfolioValue,
        autoSyncEnabled: r?.autoSyncEnabled ?? defaults.autoSyncEnabled,
        compactView: r?.compactView ?? defaults.compactView,
        showPercentageColors: r?.showPercentageColors ?? defaults.showPercentageColors,
      });
    }

    if (!existing) {
      const [inserted] = await db
        .insert(userPreferences)
        .values({ userId, ...defaults, ...updatePayload })
        .returning();

      return res.json({
        baseCurrency: inserted!.baseCurrency ?? defaults.baseCurrency,
        timezone: inserted!.timezone ?? defaults.timezone,
        theme: inserted!.theme ?? defaults.theme,
        dateFormat: inserted!.dateFormat ?? defaults.dateFormat,
        priceAlertsEnabled: inserted!.priceAlertsEnabled ?? defaults.priceAlertsEnabled,
        showPortfolioValue: inserted!.showPortfolioValue ?? defaults.showPortfolioValue,
        autoSyncEnabled: inserted!.autoSyncEnabled ?? defaults.autoSyncEnabled,
        compactView: inserted!.compactView ?? defaults.compactView,
        showPercentageColors: inserted!.showPercentageColors ?? defaults.showPercentageColors,
      });
    }

    const [updated] = await db
      .update(userPreferences)
      .set(updatePayload)
      .where(eq(userPreferences.userId, userId))
      .returning();

    res.json({
      baseCurrency: updated!.baseCurrency ?? defaults.baseCurrency,
      timezone: updated!.timezone ?? defaults.timezone,
      theme: updated!.theme ?? defaults.theme,
      dateFormat: updated!.dateFormat ?? defaults.dateFormat,
      priceAlertsEnabled: updated!.priceAlertsEnabled ?? defaults.priceAlertsEnabled,
      showPortfolioValue: updated!.showPortfolioValue ?? defaults.showPortfolioValue,
      autoSyncEnabled: updated!.autoSyncEnabled ?? defaults.autoSyncEnabled,
      compactView: updated!.compactView ?? defaults.compactView,
      showPercentageColors: updated!.showPercentageColors ?? defaults.showPercentageColors,
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
