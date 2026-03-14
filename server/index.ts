import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { sql } from './db/index.js';
import authRoutes from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import accountsRoutes from './routes/accounts.js';
import tokensRoutes from './routes/tokens.js';
import transactionsRoutes from './routes/transactions.js';
import defiRoutes from './routes/defi.js';
import alertsRoutes from './routes/alerts.js';
import analyticsRoutes from './routes/analytics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = config.PORT;
const isProd = config.NODE_ENV === 'production';

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN ?? true,
    credentials: true,
  })
);
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, try again later' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/defi', defiRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

if (isProd) {
  const clientDist = join(__dirname, '..');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    sql.end().then(() => process.exit(0));
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
