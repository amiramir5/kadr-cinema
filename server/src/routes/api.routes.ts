import { Router, Request, Response } from 'express';
import { RecommendationEngine } from '../services/recommendation-engine';
import { TmdbService } from '../services/tmdb.service';
import { OmdbService } from '../services/omdb.service';
import { TvMazeService } from '../services/tvmaze.service';
import { isTmdbConfigured, isOmdbConfigured, isGeminiConfigured } from '../config';
import { GENRE_MAP, CURATED_TITLES } from '../services/curated-cache';

const router = Router();

/**
 * Health & Configuration status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      tmdbLive: isTmdbConfigured(),
      omdbLive: isOmdbConfigured(),
      geminiLive: isGeminiConfigured(),
      geminiModel: 'gemini-3.8-flash',
      tvmazeLive: true,
    },
    message: isGeminiConfigured()
      ? 'هوش مصنوعی Gemini 3.8 Flash فعال است. اتصال زنده به دیتابیس TVmaze برقرار است.'
      : 'در حالت هوشمند پیش‌فرض. اتصال زنده به دیتابیس TVmaze برقرار است.',
  });
});

/**
 * Intelligent Recommendation
 */
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { prompt, mediaType, genreId, minRating, maxRuntime } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'لطفاً درخواست یا حال‌وهوای مورد نظر خود را بنویسید.' });
    }

    const response = await RecommendationEngine.recommend({
      prompt: prompt.trim(),
      mediaType,
      genreId,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRuntime: maxRuntime ? parseInt(maxRuntime, 10) : undefined,
    });

    res.json(response);
  } catch (err: any) {
    console.error('Error in /recommend:', err);
    res.status(500).json({ error: 'خطایی در پردازش پیشنهاد رخ داد.' });
  }
});

/**
 * Conversational Refinement
 */
router.post('/recommend/refine', async (req: Request, res: Response) => {
  try {
    const { originalPrompt, refinementPrompt, previousIds } = req.body;
    if (!originalPrompt || !refinementPrompt) {
      return res.status(400).json({ error: 'اطلاعات ناکافی برای اصلاح پیشنهاد.' });
    }

    const response = await RecommendationEngine.refine(originalPrompt, refinementPrompt, previousIds);
    res.json(response);
  } catch (err: any) {
    console.error('Error in /recommend/refine:', err);
    res.status(500).json({ error: 'خطایی در اصلاح پیشنهاد رخ داد.' });
  }
});

/**
 * Search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

    if (!query) {
      return res.json({ results: [], total: 0 });
    }

    const results = await TmdbService.searchMulti(query, page);
    res.json({ results, total: results.length });
  } catch (err: any) {
    console.error('Error in /search:', err);
    res.status(500).json({ error: 'خطا در جستجو.' });
  }
});

/**
 * Explore / Filter
 */
router.get('/explore', async (req: Request, res: Response) => {
  try {
    const mediaType = (req.query.type as string) || 'all';
    const genreId = req.query.genre ? (req.query.genre as string) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const sortBy = (req.query.sortBy as string) || 'popularity.desc';
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

    let items = [];
    if (mediaType === 'movie') {
      items = await TmdbService.discoverMovies({ withGenres: genreId, voteAverageGte: minRating, year, sortBy, page });
    } else if (mediaType === 'tv') {
      items = await TmdbService.discoverTv({ withGenres: genreId, voteAverageGte: minRating, year, sortBy, page });
    } else {
      const [m, t] = await Promise.all([
        TmdbService.discoverMovies({ withGenres: genreId, voteAverageGte: minRating, year, sortBy, page }),
        TmdbService.discoverTv({ withGenres: genreId, voteAverageGte: minRating, year, sortBy, page }),
      ]);
      items = [...m, ...t].sort((a, b) => b.popularity - a.popularity);
    }

    res.json({ results: items, total: items.length });
  } catch (err: any) {
    console.error('Error in /explore:', err);
    res.status(500).json({ error: 'خطا در کاوش عناوین.' });
  }
});

/**
 * Movie Details
 */
router.get('/movie/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const details = await TmdbService.getDetails('movie', id);

    if (!details) {
      return res.status(404).json({ error: 'عنوان یافت نشد.' });
    }

    // Enrich with IMDb rating from OMDb if available
    if (details.imdbId || details.title) {
      const omdb = await OmdbService.getRatings(details.imdbId, details.title, details.releaseYear);
      if (omdb?.imdbRating) {
        details.imdbRating = omdb.imdbRating;
      }
    }

    res.json(details);
  } catch (err: any) {
    console.error('Error in /movie/:id:', err);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات فیلم.' });
  }
});

/**
 * TV Details
 */
router.get('/tv/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    let details = await TmdbService.getDetails('tv', id);

    if (!details) {
      details = await TvMazeService.getShow(id);
    }

    if (!details) {
      return res.status(404).json({ error: 'عنوان یافت نشد.' });
    }

    // Enrich with IMDb rating from OMDb if available
    if (details.imdbId || details.title) {
      const omdb = await OmdbService.getRatings(details.imdbId, details.title, details.releaseYear);
      if (omdb?.imdbRating) {
        details.imdbRating = omdb.imdbRating;
      }
    }

    res.json(details);
  } catch (err: any) {
    console.error('Error in /tv/:id:', err);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات سریال.' });
  }
});

/**
 * Trending titles
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const items = await TmdbService.getTrending('week', 1);
    res.json({ results: items });
  } catch (err: any) {
    console.error('Error in /trending:', err);
    res.status(500).json({ error: 'خطا در دریافت برترین‌ها.' });
  }
});

/**
 * Genres list with Persian translations
 */
router.get('/genres', (req: Request, res: Response) => {
  const genres = Object.entries(GENRE_MAP).map(([id, val]) => ({
    id: parseInt(id, 10),
    name: val.en,
    nameFa: val.fa,
  }));
  res.json({ genres });
});

export default router;
