import { RecommendationRequest, RecommendationResponse, ScoredRecommendation, MediaItem, StructuredInterpretation } from '../types';
import { PersianNlpService } from './persian-nlp.service';
import { TmdbService } from './tmdb.service';
import { CURATED_TITLES } from './curated-cache';
import { isTmdbConfigured } from '../config';

export class RecommendationEngine {
  /**
   * Main recommendation pipeline
   */
  public static async recommend(req: RecommendationRequest): Promise<RecommendationResponse> {
    // Stage 1: Interpret natural language request
    const interpretation = PersianNlpService.parsePrompt(req.prompt);

    // Apply any explicit query overrides from UI controls
    if (req.mediaType && req.mediaType !== 'all') {
      interpretation.mediaType = req.mediaType;
    }
    if (req.genreId && !interpretation.genreIds.includes(req.genreId)) {
      interpretation.genreIds.push(req.genreId);
    }
    if (req.minRating) {
      interpretation.minimumRating = req.minRating;
    }
    if (req.maxRuntime) {
      interpretation.runtimeMax = req.maxRuntime;
    }

    // Stage 2: Multi-source candidate retrieval
    const candidates = await this.retrieveCandidates(interpretation, req);

    // Stage 3: Deep scoring & ranking
    const scoredList = this.rankCandidates(candidates, interpretation, req);

    // Stage 4: Generate contextual Persian explanations
    const finalResults = scoredList.slice(0, 15).map(item => ({
      ...item,
      matchReasonFa: this.generatePersianExplanation(item.media, req.prompt, interpretation, item.matchedAttributes),
    }));

    return {
      interpretation,
      results: finalResults,
      totalFound: scoredList.length,
      engineUsed: 'persian-nlp-deterministic',
      tmdbLive: isTmdbConfigured(),
    };
  }

  /**
   * Refine previous recommendations with conversational feedback
   * e.g. "اینها خیلی تلخ بودن، یه مقدار سبکتر پیشنهاد بده"
   */
  public static async refine(originalPrompt: string, refinementPrompt: string, previousResults?: number[]): Promise<RecommendationResponse> {
    const combinedPrompt = `${originalPrompt}. نکته و اصلاحیه کاربر: ${refinementPrompt}`;
    return this.recommend({
      prompt: combinedPrompt,
      conversationHistory: [
        { role: 'user', content: originalPrompt },
        { role: 'assistant', content: 'نتایج اولیه نمایش داده شد.' },
        { role: 'user', content: refinementPrompt },
      ],
    });
  }

  /**
   * Stage 2: Candidate Retrieval from TMDB / Curated sources
   */
  private static async retrieveCandidates(
    interp: StructuredInterpretation,
    req: RecommendationRequest
  ): Promise<MediaItem[]> {
    const candidateMap = new Map<number, MediaItem>();

    // 1. Always include relevant curated items
    for (const title of CURATED_TITLES) {
      candidateMap.set(title.id, title);
    }

    // 2. If TMDB is live, fetch discovery streams
    if (isTmdbConfigured()) {
      try {
        const genreQuery = interp.genreIds.length > 0 ? interp.genreIds.slice(0, 3).join(',') : undefined;

        if (interp.mediaType === 'movie' || interp.mediaType === 'all') {
          const movies = await TmdbService.discoverMovies({
            withGenres: genreQuery,
            voteAverageGte: interp.minimumRating || 6.5,
            voteCountGte: 100,
            sortBy: 'popularity.desc',
          });
          for (const m of movies) candidateMap.set(m.id, m);
        }

        if (interp.mediaType === 'tv' || interp.mediaType === 'all') {
          const tvs = await TmdbService.discoverTv({
            withGenres: genreQuery,
            voteAverageGte: interp.minimumRating || 6.5,
            voteCountGte: 50,
            sortBy: 'popularity.desc',
          });
          for (const t of tvs) candidateMap.set(t.id, t);
        }

        // If reference titles exist, search TMDB for them to enrich similar pools
        for (const refTitle of interp.referenceTitles) {
          const refResults = await TmdbService.searchMulti(refTitle, 1);
          for (const r of refResults.slice(0, 3)) {
            candidateMap.set(r.id, r);
          }
        }
      } catch (err: any) {
        console.warn('[retrieveCandidates] TMDB query error:', err?.message);
      }
    }

    return Array.from(candidateMap.values());
  }

  /**
   * Stage 3: Deep Multi-Factor Scoring
   */
  private static rankCandidates(
    candidates: MediaItem[],
    interp: StructuredInterpretation,
    req: RecommendationRequest
  ): Array<{
    media: MediaItem;
    score: number;
    matchScore: number;
    matchReasonFa: string;
    matchedAttributes: {
      genres: string[];
      moods: string[];
      narrativePoints: string[];
    };
  }> {
    return candidates
      .map(media => {
        let score = 50; // base score
        const matchedGenres: string[] = [];
        const matchedMoods: string[] = [];
        const matchedNarrative: string[] = [];

        // 1. Media Type match
        if (interp.mediaType !== 'all') {
          if (media.mediaType === interp.mediaType) {
            score += 20;
          } else {
            score -= 40; // Heavy penalty if wrong media type explicitly requested
          }
        }

        // 2. Genre Alignment
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

        // 3. Mood & Overview Content Analysis
        const textToAnalyze = `${media.title} ${media.overview} ${media.overviewFa || ''} ${media.tagline || ''}`.toLowerCase();

        for (const mood of interp.mood) {
          if (mood.includes('تاریک') && (textToAnalyze.includes('kill') || textToAnalyze.includes('crime') || textToAnalyze.includes('dark') || media.genreIds.includes(80) || media.genreIds.includes(9648))) {
            score += 15;
            matchedMoods.push('تاریک و عمیق');
          }
          if (mood.includes('امیدوارکننده') && (media.genreIds.includes(35) || textToAnalyze.includes('hope') || textToAnalyze.includes('life') || textToAnalyze.includes('friend'))) {
            score += 15;
            matchedMoods.push('امیدوارکننده و الهام‌بخش');
          }
          if (mood.includes('دلهره‌آور') && (media.genreIds.includes(53) || media.genreIds.includes(27) || textToAnalyze.includes('fear') || textToAnalyze.includes('danger'))) {
            score += 15;
            matchedMoods.push('تعلیق و دلهره');
          }
          if (mood.includes('احساسی') && (media.genreIds.includes(18) || media.genreIds.includes(10749))) {
            score += 12;
            matchedMoods.push('احساسی و عاطفی');
          }
          if (mood.includes('سبک') && media.genreIds.includes(35)) {
            score += 15;
            matchedMoods.push('سبک و مفرح');
          }
        }

        // 4. Runtime constraint
        if (interp.runtimeMax && media.runtime) {
          if (media.runtime <= interp.runtimeMax) {
            score += 12;
            matchedNarrative.push(`زمان مناسب (${media.runtime} دقیقه)`);
          } else if (media.runtime > interp.runtimeMax + 20) {
            score -= 25;
          }
        }

        // 5. Minimum Rating constraint
        if (interp.minimumRating) {
          if (media.voteAverage >= interp.minimumRating) {
            score += 12;
            matchedNarrative.push(`امتیاز بالا (${media.voteAverage})`);
          } else if (media.voteAverage < interp.minimumRating - 0.5) {
            score -= 20;
          }
        }

        // 6. Quality & Popularity Boost
        score += (media.voteAverage / 10) * 15;
        if (media.voteCount > 1000) score += 5;
        if (media.voteCount > 5000) score += 5;

        // 7. Reference Titles Similarity Bonus
        for (const ref of interp.referenceTitles) {
          if (media.title.toLowerCase().includes(ref.toLowerCase()) || media.originalTitle.toLowerCase().includes(ref.toLowerCase())) {
            score += 30;
            matchedNarrative.push(`الهام گرفته از ${ref}`);
          }
        }

        // 8. Negative / Unwanted Filters
        for (const unwanted of interp.unwantedContent) {
          if (unwanted.includes('جامپ‌اسکر') && media.genreIds.includes(27) && !media.genres.includes('معمایی')) {
            score -= 15;
          }
          if (unwanted.includes('عاشقانه') && media.genreIds.includes(10749)) {
            score -= 30; // Strong penalty if romance explicitly avoided
          }
          if (unwanted.includes('تلخ') && (media.genreIds.includes(80) || media.genreIds.includes(27))) {
            score -= 20;
          }
        }

        // Normalize match percentage between 60% and 99%
        const normalizedMatch = Math.min(99, Math.max(55, Math.round((score / 140) * 100)));

        return {
          media,
          score,
          matchScore: normalizedMatch,
          matchReasonFa: '',
          matchedAttributes: {
            genres: Array.from(new Set(matchedGenres)),
            moods: Array.from(new Set(matchedMoods)),
            narrativePoints: Array.from(new Set(matchedNarrative)),
          },
        };
      })
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Stage 4: Generate Persian Match Rationale
   */
  private static generatePersianExplanation(
    media: MediaItem,
    rawPrompt: string,
    interp: StructuredInterpretation,
    attrs: { genres: string[]; moods: string[]; narrativePoints: string[] }
  ): string {
    const titleFa = media.titleFa || media.title;

    if (attrs.narrativePoints.some(p => p.includes('الهام گرفته'))) {
      return `این اثر به دلیل شباهت عمیق تماتیک و بصری با ${interp.referenceTitles.join(' و ')}، همان حس تعلیق و اتمسفر گیرا را بازآفرینی می‌کند.`;
    }

    if (rawPrompt.includes('قاتل') || rawPrompt.includes('معمایی')) {
      if (media.genreIds.includes(9648) || media.genreIds.includes(80)) {
        return `با توجه به علاقه شما به معماهای غیرقابل پیش‌بینی، ${titleFa} داستانی پر پیچ‌وخم و هوشمندانه دارد که تا لحظه گره‌گشایی، ذهن مخاطب را به چالش می‌کشد.`;
      }
    }

    if (rawPrompt.includes('کوتاه') || (interp.runtimeMax && interp.runtimeMax <= 45)) {
      if (media.mediaType === 'tv') {
        return `قسمت‌های حدود ۳۰ دقیقه‌ای و ریتم پویا، این اثر را انتخابی بی‌نظیر برای تماشا در پایان یک روز شلوغ یا ساعات پایانی شب کرده است.`;
      }
    }

    if (rawPrompt.includes('امیدوارکننده') || rawPrompt.includes('خوش‌ساخت')) {
      return `این اثر با فیلم‌نامه‌ای روان و شخصیت‌پردازی صمیمی، روایتی تاثیرگذار و حال‌خوب‌کن ارائه می‌دهد و فارغ از کلیشه‌های مرسوم سینمایی است.`;
    }

    if (rawPrompt.includes('ترسناک') || rawPrompt.includes('دلهره')) {
      return `به جای تکیه بر غافلگیری‌های ارزان (جامپ‌اسکر)، با فضاسازی دلهره‌آور و تعلیق عمیق روانشناختی، ترسی ماندگار در ذهن ایجاد می‌کند.`;
    }

    // Default rich rationale
    const points: string[] = [];
    if (attrs.genres.length > 0) points.push(`تطابق در ژانر ${attrs.genres.slice(0, 2).join(' و ')}`);
    if (attrs.moods.length > 0) points.push(`فضاسازی ${attrs.moods[0]}`);
    if (media.voteAverage >= 8.0) points.push(`امتیاز درخشان ${media.voteAverage} از بینندگان`);

    return `به دلیل ${points.join('، ')} و استقبال بالای منتقدان و مخاطبان، یکی از بهترین گزینه‌ها برای حال‌وهوای درخواستی شماست.`;
  }
}
