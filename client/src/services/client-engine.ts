import { RecommendationResponse, MediaItem, MediaDetail, Genre, StructuredInterpretation } from '../types';
import { PersianNlpService } from './persian-nlp.service';
import { GeminiClientService } from './gemini.service';
import { ClientOmdbService } from './omdb.service';
import { CURATED_TITLES, GENRE_MAP } from './curated-cache';
import { ClientTvMazeService } from './tvmaze.service';

export class ClientEngine {
  public static async recommend(params: {
    prompt: string;
    mediaType?: string;
    genreId?: number;
    minRating?: number;
    maxRuntime?: number;
  }): Promise<RecommendationResponse> {
    const rawLower = params.prompt.toLowerCase();
    const isAnimeRequested = rawLower.includes('انیمه') || rawLower.includes('anime') || rawLower.includes('انیمیشن');
    const isComedyRequested = rawLower.includes('فان') || rawLower.includes('کمدی') || rawLower.includes('خنده') || rawLower.includes('بخند') || rawLower.includes('بامزه') || rawLower.includes('شاد');
    const isDarkRequested = rawLower.includes('دارک') || rawLower.includes('مرموز') || rawLower.includes('ترسناک') || rawLower.includes('جنایی') || rawLower.includes('معمایی');

    // 1. Try Gemini LLM first, fallback to deterministic Persian NLP
    let interp: StructuredInterpretation | null = await GeminiClientService.interpretPrompt(params.prompt);
    let engineUsed: 'llm-hybrid' | 'persian-nlp-deterministic' = 'llm-hybrid';

    if (!interp) {
      interp = PersianNlpService.parsePrompt(params.prompt);
      engineUsed = 'persian-nlp-deterministic';
    }

    // Force strict intent if user asked for Anime or Comedy
    if (isAnimeRequested) {
      if (!interp.genres.includes('انیمیشن')) interp.genres.push('انیمیشن');
      if (!interp.genreIds.includes(16)) interp.genreIds.push(16);
    }
    if (isComedyRequested) {
      if (!interp.genres.includes('کمدی')) interp.genres.push('کمدی');
      if (!interp.genreIds.includes(35)) interp.genreIds.push(35);
      if (!interp.mood.includes('شاد و خنده‌دار')) interp.mood.push('شاد و خنده‌دار');
    }

    // Apply explicit filters if provided
    if (params.mediaType && params.mediaType !== 'all') {
      interp.mediaType = params.mediaType as any;
    }
    if (params.genreId && !interp.genreIds.includes(params.genreId)) {
      interp.genreIds.push(params.genreId);
    }
    if (params.minRating) {
      interp.minimumRating = params.minRating;
    }
    if (params.maxRuntime) {
      interp.runtimeMax = params.maxRuntime;
    }

    let candidatePool: MediaItem[] = [...CURATED_TITLES];

    // Query live OMDb if specific titles or keywords searched
    if (interp.referenceTitles && interp.referenceTitles.length > 0) {
      try {
        const omdbResults = await ClientOmdbService.search(interp.referenceTitles[0]);
        for (const m of omdbResults) {
          if (!candidatePool.some(c => c.id === m.id)) {
            candidatePool.push(m);
          }
        }
      } catch {}
    }

    // Negation detection from prompt (e.g. "به جز اتک", "بدون ترسناک", "به غیر از بریکینگ بد")
    const unwantedKeywords: string[] = [...(interp.unwantedContent || [])];
    const excludeMatches = rawLower.match(/(?:به جز|به‌جز|به غیر از|بدون|به غیراز)\s+([^\s,،]+)/g);
    if (excludeMatches) {
      excludeMatches.forEach(m => {
        const cleaned = m.replace(/(?:به جز|به‌جز|به غیر از|بدون|به غیراز)\s+/g, '').trim();
        if (cleaned) unwantedKeywords.push(cleaned);
      });
    }

    // HARD FILTERING:
    // Exclude unwanted titles or keywords
    if (unwantedKeywords.length > 0) {
      candidatePool = candidatePool.filter(m => {
        const titleCombined = `${m.title} ${m.originalTitle} ${m.titleFa || ''} ${m.genres.join(' ')}`.toLowerCase();
        for (const bad of unwantedKeywords) {
          const b = bad.toLowerCase().trim();
          if (!b) continue;
          if (b.includes('اتک') || b.includes('attack') || b.includes('تایتان')) {
            if (titleCombined.includes('attack') || titleCombined.includes('titan') || titleCombined.includes('تایتان') || titleCombined.includes('اتک')) {
              return false;
            }
          }
          if (b.includes('بریکینگ') || b.includes('breaking')) {
            if (titleCombined.includes('breaking') || titleCombined.includes('بریکینگ')) {
              return false;
            }
          }
          if (titleCombined.includes(b)) {
            return false;
          }
        }
        return true;
      });
    }

    // If user explicitly asked for ANIME, strictly exclude non-anime!
    if (isAnimeRequested) {
      candidatePool = candidatePool.filter(m => m.genreIds.includes(16) || m.genres.some(g => g.includes('انیمه') || g.includes('انیمیشن')));
    }

    // If user asked for COMEDY/FUN, strictly down-rank or exclude heavy dark dramas
    if (isComedyRequested && !isDarkRequested) {
      candidatePool = candidatePool.filter(m => {
        if (m.genreIds.includes(80) && !m.genreIds.includes(35)) return false;
        return true;
      });
    }

    const scored = candidatePool.map(media => {
      let score = 50;
      const matchedGenres: string[] = [];
      const matchedMoods: string[] = [];
      const matchedNarrative: string[] = [];

      // Anime bonus
      if (isAnimeRequested && (media.genreIds.includes(16) || media.genres.includes('انیمیشن'))) {
        score += 45;
        matchedGenres.push('انیمیشن / انیمه');
      }

      // Comedy bonus
      if (isComedyRequested && (media.genreIds.includes(35) || media.genres.includes('کمدی'))) {
        score += 40;
        matchedMoods.push('فان و خنده‌دار');
      }

      if (interp!.genreIds.length > 0) {
        const overlap = media.genreIds.filter(gid => interp!.genreIds.includes(gid));
        if (overlap.length > 0) {
          score += overlap.length * 15;
          for (const gid of overlap) {
            const name = media.genres[media.genreIds.indexOf(gid)];
            if (name && !matchedGenres.includes(name)) matchedGenres.push(name);
          }
        }
      }

      // Rating bonus
      score += (media.voteAverage / 10) * 15;

      const normalizedMatch = Math.min(99, Math.max(65, Math.round((score / 150) * 100)));

      return {
        media,
        score,
        matchScore: normalizedMatch,
        matchReasonFa: this.generateReason(media, params.prompt, isAnimeRequested, isComedyRequested),
        matchedAttributes: {
          genres: Array.from(new Set(matchedGenres)),
          moods: Array.from(new Set(matchedMoods)),
          narrativePoints: matchedNarrative,
        },
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return {
      interpretation: interp,
      results: scored,
      totalFound: scored.length,
      engineUsed,
      tmdbLive: false,
    };
  }

  public static async refine(originalPrompt: string, refinementPrompt: string): Promise<RecommendationResponse> {
    return this.recommend({ prompt: refinementPrompt.trim() });
  }

  public static async search(query: string): Promise<{ results: MediaItem[]; total: number }> {
    const q = query.toLowerCase().trim();
    const curated: MediaItem[] = CURATED_TITLES.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.originalTitle.toLowerCase().includes(q) ||
      (item.titleFa && item.titleFa.toLowerCase().includes(q)) ||
      (item.director && item.director.toLowerCase().includes(q))
    );

    try {
      const omdbResults = await ClientOmdbService.search(query);
      const combined: MediaItem[] = [...curated];
      for (const m of omdbResults) {
        if (!combined.some(c => c.id === m.id)) {
          combined.push(m);
        }
      }
      return { results: combined, total: combined.length };
    } catch {
      return { results: curated, total: curated.length };
    }
  }

  public static async explore(filters: {
    type?: string;
    genre?: string | number;
    minRating?: number;
    sortBy?: string;
  }): Promise<{ results: MediaItem[]; total: number }> {
    let list = [...CURATED_TITLES];

    if (filters.type && filters.type !== 'all') {
      list = list.filter(i => i.mediaType === filters.type);
    }
    if (filters.genre) {
      const gid = typeof filters.genre === 'string' ? parseInt(filters.genre, 10) : filters.genre;
      list = list.filter(i => i.genreIds.includes(gid));
    }
    if (filters.minRating) {
      list = list.filter(i => i.voteAverage >= filters.minRating!);
    }

    if (filters.sortBy === 'vote_average.desc') {
      list.sort((a, b) => b.voteAverage - a.voteAverage);
    } else if (filters.sortBy === 'primary_release_date.desc') {
      list.sort((a, b) => b.releaseYear - a.releaseYear);
    } else {
      list.sort((a, b) => b.popularity - a.popularity);
    }

    return { results: list, total: list.length };
  }

  public static async getDetail(id: number): Promise<MediaDetail | null> {
    const cached = CURATED_TITLES.find(c => c.id === id);
    if (cached) return cached;

    try {
      const omdbMovie = await ClientOmdbService.getMovie(id);
      if (omdbMovie) return omdbMovie;
    } catch {}

    try {
      return await ClientTvMazeService.getShow(id);
    } catch {
      return null;
    }
  }

  public static getTrending(): { results: MediaItem[] } {
    return { results: CURATED_TITLES };
  }

  public static getGenres(): { genres: Genre[] } {
    const genres = Object.entries(GENRE_MAP).map(([id, val]) => ({
      id: parseInt(id, 10),
      name: val.en,
      nameFa: val.fa,
    }));
    return { genres };
  }

  private static generateReason(media: MediaItem, prompt: string, isAnime: boolean, isComedy: boolean): string {
    const titleFa = media.titleFa || media.title;
    if (isAnime && isComedy) {
      return `کاملاً مطابق با درخواست انیمه کمدی و فان شما؛ اثر ${titleFa} سرشار از لحظات خنده‌دار، شخصیت‌های پرانرژی و امتیاز بالای ${media.voteAverage} است.`;
    }
    if (isAnime) {
      return `به دلیل تطابق مستقیم با علاقه‌مندی شما به دنیای انیمه با داستان‌پردازی قوی و امتیاز درخشان ${media.voteAverage}.`;
    }
    if (isComedy) {
      return `انتخاب شده به دلیل فضای بسیار شاد، شوخی‌های هوشمندانه و حس‌وحال مفرح جهت خندیدن و بهبود حال‌وهوا.`;
    }
    return `به دلیل تطابق در ژانر ${media.genres.slice(0, 2).join(' و ')}، نمره بالای ${media.voteAverage} و استقبال گسترده منتقدان جهانی.`;
  }
}
