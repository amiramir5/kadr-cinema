import express from 'express';
import cors from 'cors';
import { CONFIG, isTmdbConfigured, isOmdbConfigured } from './config';
import apiRouter from './routes/api.routes';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Fallback error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[KADR Server Error]:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`====================================================`);
    console.log(`🎬 KADR (کادر) Cinema Platform Backend Server`);
    console.log(`🚀 Running at: http://localhost:${CONFIG.PORT}`);
    console.log(`📡 TMDB API: ${isTmdbConfigured() ? '✅ Connected (Live Token)' : '⚡ Curated Fallback Engine Active (Set TMDB_API_READ_ACCESS_TOKEN in .env)'}`);
    console.log(`⭐ OMDb API: ${isOmdbConfigured() ? '✅ Connected' : '⚪ Not configured (Optional)'}`);
    console.log(`====================================================`);
  });
}

export { app };
