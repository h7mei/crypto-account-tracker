import { Router, Response } from 'express';
type ExpressRouter = Router;
import { z } from 'zod';
import { db, alerts } from '../db/index.js';
import { eq, and, asc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: ExpressRouter = Router();
router.use(authMiddleware);

const alertTypeEnum = z.enum(['price', 'portfolio', 'transaction', 'risk']);

const createAlertSchema = z.object({
  type: alertTypeEnum,
  title: z.string().min(1),
  message: z.string().min(1),
  condition: z.string().min(1),
  triggered: z.boolean().default(false),
});

const updateAlertSchema = createAlertSchema.partial();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, req.user!.id))
      .orderBy(asc(alerts.createdAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        message: r.message,
        triggered: r.triggered,
        condition: r.condition,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .insert(alerts)
      .values({
        userId: req.user!.id,
        type: parsed.data.type,
        title: parsed.data.title,
        message: parsed.data.message,
        condition: parsed.data.condition,
        triggered: parsed.data.triggered,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      triggered: row.triggered,
      condition: row.condition,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
    }

    const [row] = await db
      .update(alerts)
      .set(parsed.data)
      .where(
        and(eq(alerts.id, req.params.id as string), eq(alerts.userId, req.user!.id))
      )
      .returning();

    if (!row) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      triggered: row.triggered,
      condition: row.condition,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error('Update alert error:', err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [row] = await db
      .delete(alerts)
      .where(
        and(eq(alerts.id, req.params.id as string), eq(alerts.userId, req.user!.id))
      )
      .returning({ id: alerts.id });

    if (!row) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
