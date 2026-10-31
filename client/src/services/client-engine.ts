import { RecommendationResponse, ScoredRecommendation, MediaItem, MediaDetail, Genre } from '../types';
import { PersianNlpService } from './persian-nlp.service';
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
    const interp = PersianNlpService.parsePrompt(params.prompt);

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

    const candidatePool: MediaItem[] = [...CURATED_TITLES];

    // Query live TVmaze for matching series
    if (interp.referenceTitles.length > 0 || interp.genres.length > 0) {
      try {
        const query = interp.referenceTitles[0] || interp.genres[0];
        const tvResults = await ClientTvMazeService.search(query);
        for (const show of tvResults) {
          if (!candidatePool.some(c => c.id === show.id)) {
            candidatePool.push(show);
          }
        }
      } catch (e) {
        // Fallback silently to curated pool
      }
    }

    const scored = candidatePool.map(media => {
      let score = 50;
      const matchedGenres: string[] = [];
      const matchedMoods: string[] = [];
      const matchedNarrative: string[] = [];

      if (interp.mediaType !== 'all') {
        if (media.mediaType === interp.mediaType) score += 20;
        else score -= 40;
      }

      if (interp.genreIds.length > 0) {
        const overlap = media.genreIds.filter(gid => interp.genreIds.includes(gid));
        if (overlap.length > 0) {
          score += overlap.length * 15;
          for (const gid of overlap) {
            const name = media.genres[media.genreIds.indexOf(gid)];
            if (name) matchedGenres.push(name);
          }
        } else {
          score -= 15;
        }
      }

      const textToAnalyze = `${media.title} ${media.overview} ${media.overviewFa || ''}`.toLowerCase();
      for (const mood of interp.mood) {
        if (mood.includes('تاریک') && (textToAnalyze.includes('kill') || textToAnalyze.includes('crime') || media.genreIds.includes(80))) {
          score += 15;
          matchedMoods.push('تاریک و عمیق');
        }
        if (mood.includes('امیدوارکننده') && (media.genreIds.includes(35) || textToAnalyze.includes('hope'))) {
          score += 15;
          matchedMoods.push('امیدوارکننده');
        }
        if (mood.includes('دلهره‌آور') && (media.genreIds.includes(53) || media.genreIds.includes(27))) {
          score += 15;
          matchedMoods.push('تعلیق و دلهره');
        }
        if (mood.includes('احساسی') && media.genreIds.includes(18)) {
          score += 12;
          matchedMoods.push('عمیقاً احساسی');
        }
      }

      if (interp.runtimeMax && media.runtime) {
        if (media.runtime <= interp.runtimeMax) score += 12;
        else if (media.runtime > interp.runtimeMax + 20) score -= 25;
      }

      if (interp.minimumRating) {
        if (media.voteAverage >= interp.minimumRating) score += 12;
        else if (media.voteAverage < interp.minimumRating - 0.5) score -= 20;
      }

      score += (media.voteAverage / 10) * 15;

      for (const ref of interp.referenceTitles) {
        if (media.title.toLowerCase().includes(ref.toLowerCase()) || media.originalTitle.toLowerCase().includes(ref.toLowerCase())) {
          score += 30;
          matchedNarrative.push(`الهام‌گرفته از ${ref}`);
        }
      }

      for (const unwanted of interp.unwantedContent) {
        if (unwanted.includes('عاشقانه') && media.genreIds.includes(10749)) score -= 30;
        if (unwanted.includes('جامپ‌اسکر') && media.genreIds.includes(27) && !media.genres.includes('معمایی')) score -= 15;
      }

      const normalizedMatch = Math.min(99, Math.max(55, Math.round((score / 140) * 100)));

      return {
        media,
        score,
        matchScore: normalizedMatch,
        matchReasonFa: this.generateReason(media, params.prompt, interp, matchedGenres, matchedMoods),
        matchedAttributes: {
          genres: Array.from(new Set(matchedGenres)),
          moods: Array.from(new Set(matchedMoods)),
          narrativePoints: Array.from(new Set(matchedNarrative)),
        },
      };
    })
    .filter(item => item.score > 30)
    .sort((a, b) => b.score - a.score);

    return {
      interpretation: interp,
      results: scored.slice(0, 15),
      totalFound: scored.length,
      engineUsed: 'persian-nlp-deterministic',
      tmdbLive: false,
    };
  }

  public static async refine(originalPrompt: string, refinementPrompt: string): Promise<RecommendationResponse> {
    return this.recommend({ prompt: `${originalPrompt} (${refinementPrompt})` });
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
      const tvmazeResults = await ClientTvMazeService.search(query);
      const combined: MediaItem[] = [...curated];
      for (const show of tvmazeResults) {
        if (!combined.some(c => c.id === show.id)) {
          combined.push(show);
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

  private static generateReason(media: MediaItem, prompt: string, interp: any, genres: string[], moods: string[]): string {
    const titleFa = media.titleFa || media.title;

    if (prompt.includes('قاتل') || prompt.includes('معمایی')) {
      if (media.genreIds.includes(9648) || media.genreIds.includes(80)) {
        return `با توجه به علاقه شما به معماهای غیرقابل پیش‌بینی، ${titleFa} داستانی پر پیچ‌وخم و هوشمندانه دارد که تا لحظه گره‌گشایی، ذهن مخاطب را به چالش می‌کشد.`;
      }
    }
    if (prompt.includes('کوتاه') || (interp.runtimeMax && interp.runtimeMax <= 45)) {
      if (media.mediaType === 'tv') {
        return `قسمت‌های حدود ۳۰ دقیقه‌ای و ریتم پویا، این اثر را انتخابی بی‌نظیر برای تماشا در پایان یک روز شلوغ یا ساعات پایانی شب کرده است.`;
      }
    }
    if (prompt.includes('امیدوارکننده') || prompt.includes('خوش‌ساخت')) {
      return `این اثر با فیلم‌نامه‌ای روان و شخصیت‌پردازی صمیمی، روایتی تاثیرگذار و حال‌خوب‌کن ارائه می‌دهد و فارغ از کلیشه‌های مرسوم سینمایی است.`;
    }
    if (prompt.includes('ترسناک') || prompt.includes('دلهره')) {
      return `به جای تکیه بر غافلگیری‌های ارزان (جامپ‌اسکر)، با فضاسازی دلهره‌آور و تعلیق عمیق روانشناختی، ترسی ماندگار در ذهن ایجاد می‌کند.`;
    }
    return `به دلیل تطابق در ژانر ${media.genres.slice(0, 2).join(' و ')}، نمره بالای ${media.voteAverage} از بینندگان و استقبال گسترده منتقدان جهانی.`;
  }
}
