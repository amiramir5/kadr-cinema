import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, RefreshCw, Send, ArrowUpDown, Film, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { RecommendationResponse, ScoredRecommendation } from '../types';
import { KadrApi } from '../services/api';
import { RecommendationCard } from '../components/RecommendationCard';
import { useUser } from '../context/UserContext';

type SortOption = 'match' | 'rating' | 'newest' | 'runtime' | 'popular';

export const Discover: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addSearchHistory } = useUser();

  const queryPrompt = searchParams.get('q') || '';
  const mediaTypeParam = searchParams.get('type') || 'all';
  const genreParam = searchParams.get('genre') ? parseInt(searchParams.get('genre')!, 10) : undefined;
  const minRatingParam = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
  const runtimeParam = searchParams.get('runtime') ? parseInt(searchParams.get('runtime')!, 10) : undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendationResponse | null>(null);

  // Conversational Refinement state
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('match');

  const fetchRecommendations = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await KadrApi.getRecommendations({
        prompt: promptText,
        mediaType: mediaTypeParam,
        genreId: genreParam,
        minRating: minRatingParam,
        maxRuntime: runtimeParam,
      });

      setData(res);
      addSearchHistory(promptText, res.results.length);
    } catch (err: any) {
      console.error('Discovery error:', err);
      setError(err?.response?.data?.error || 'خطا در ارتباط با موتور کشف فیلم. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryPrompt) {
      fetchRecommendations(queryPrompt);
    }
  }, [queryPrompt, mediaTypeParam, genreParam, minRatingParam, runtimeParam]);

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || !data) return;

    setIsRefining(true);
    setError(null);

    try {
      const previousIds = data.results.map(r => r.media.id);
      const res = await KadrApi.refineRecommendations({
        originalPrompt: queryPrompt,
        refinementPrompt: refinementInput.trim(),
        previousIds,
      });

      setData(res);
      // Update URL with new combined context
      const newQuery = `${queryPrompt} (${refinementInput.trim()})`;
      setSearchParams({ q: newQuery });
      setRefinementInput('');
    } catch (err: any) {
      console.error('Refinement error:', err);
      setError('خطا در اعمال اصلاحیه. لطفاً مجدداً امتحان کنید.');
    } finally {
      setIsRefining(false);
    }
  };

  // Sorting
  const getSortedResults = (): ScoredRecommendation[] => {
    if (!data?.results) return [];
    const list = [...data.results];

    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => b.media.voteAverage - a.media.voteAverage);
      case 'newest':
        return list.sort((a, b) => b.media.releaseYear - a.media.releaseYear);
      case 'runtime':
        return list.sort((a, b) => (a.media.runtime || 999) - (b.media.runtime || 999));
      case 'popular':
        return list.sort((a, b) => b.media.popularity - a.media.popularity);
      case 'match':
      default:
        return list.sort((a, b) => b.matchScore - a.matchScore);
    }
  };

  const sortedResults = getSortedResults();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-kadr-text-muted hover:text-kadr-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          <span>بازگشت به جستجوی اصلی</span>
        </button>

        {data && (
          <span className="text-xs text-kadr-text-muted bg-kadr-surface border border-kadr-border px-3 py-1 rounded-cinema-pill">
            موتور تحلیل: {data.engineUsed === 'llm-hybrid' ? 'هوش مصنوعی زنده' : 'سیستم استنتاج معنایی فارسی'}
          </span>
        )}
      </div>

      {/* Query Interpretation Summary Card */}
      {data?.interpretation && (
        <div className="bg-kadr-surface rounded-cinema p-5 border border-kadr-border shadow-cinema-subtle space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kadr-border/70 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kadr-accent" />
              <h2 className="font-extrabold text-base text-kadr-text">
                تحلیل درخواست: «{queryPrompt}»
              </h2>
            </div>
            <span className="text-xs text-kadr-primary font-bold bg-kadr-primary-light px-2.5 py-0.5 rounded-full">
              {data.results.length} پیشنهاد هدفمند
            </span>
          </div>

          {/* Structured Interpretation Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {data.interpretation.mediaType !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-kadr-bg border border-kadr-border text-kadr-text font-medium">
                نوع: {data.interpretation.mediaType === 'movie' ? 'فیلم سینمایی' : 'سریال'}
              </span>
            )}
            {data.interpretation.genres.map(g => (
              <span key={g} className="px-2.5 py-1 rounded-full bg-kadr-primary-light text-kadr-primary font-medium">
                ژانر: {g}
              </span>
            ))}
            {data.interpretation.mood.map(m => (
              <span key={m} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                حال‌وهوا: {m}
              </span>
            ))}
            {data.interpretation.runtimeMax && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                زمان: زیر {data.interpretation.runtimeMax} دقیقه
              </span>
            )}
            {data.interpretation.minimumRating && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                امتیاز: +{data.interpretation.minimumRating}
              </span>
            )}
            {data.interpretation.narrativePreferences.map(n => (
              <span key={n} className="px-2.5 py-1 rounded-full bg-kadr-accent-light text-kadr-accent border border-kadr-accent/30 font-medium">
                {n}
              </span>
            ))}
          </div>

          <p className="text-xs text-kadr-text-muted">
            {data.interpretation.persianSummary}
          </p>
        </div>
      )}

      {/* Conversational Refinement Bar */}
      <div className="bg-kadr-surface rounded-cinema p-4 border border-kadr-border shadow-cinema-subtle">
        <form onSubmit={handleRefineSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="اصلاح یا تدقیق پیشنهادها... (مثلاً: اینها خیلی تلخ بودن، یه مقدار سبکتر پیشنهاد بده)"
              className="w-full bg-kadr-bg rounded-cinema-pill border border-kadr-border px-4 py-2 text-xs sm:text-sm text-kadr-text outline-none focus:border-kadr-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!refinementInput.trim() || isRefining}
            className="w-full sm:w-auto px-5 py-2 rounded-cinema-pill bg-kadr-primary hover:bg-kadr-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 rotate-180" />}
            <span>بهبود نتایج</span>
          </button>
        </form>
      </div>

      {/* Sorting & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-kadr-border pb-4">
        <div className="flex items-center gap-2 text-xs text-kadr-text-muted">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>مرتب‌سازی بر اساس:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-kadr-surface p-1 rounded-cinema-pill border border-kadr-border text-xs">
          <button
            onClick={() => setSortBy('match')}
            className={`px-3 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              sortBy === 'match' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            بیشترین تطابق
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              sortBy === 'rating' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            بالاترین امتیاز
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              sortBy === 'newest' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            جدیدترین
          </button>
          <button
            onClick={() => setSortBy('runtime')}
            className={`px-3 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              sortBy === 'runtime' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            کوتاه‌ترین زمان
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              sortBy === 'popular' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            محبوب‌ترین
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 text-kadr-primary py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="font-bold text-sm">در حال تحلیل سلیقه و کاوش بهترین عناوین...</span>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-kadr-surface/60 rounded-cinema border border-kadr-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-cinema bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={() => fetchRecommendations(queryPrompt)}
            className="px-4 py-2 rounded-cinema-pill bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Results List */}
      {!loading && !error && sortedResults.length > 0 && (
        <div className="space-y-4">
          {sortedResults.map((item, index) => (
            <RecommendationCard key={item.media.id} item={item} rank={index + 1} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!data || sortedResults.length === 0) && (
        <div className="text-center py-16 space-y-4 bg-kadr-surface rounded-cinema border border-kadr-border p-8">
          <Film className="w-12 h-12 text-kadr-text-muted mx-auto stroke-1" />
          <h3 className="font-bold text-lg text-kadr-text">عنوانی با این ویژگی‌ها پیدا نشد</h3>
          <p className="text-xs text-kadr-text-muted max-w-md mx-auto">
            می‌توانید درخواست خود را کمی کلی‌تر بنویسید یا فیلترهای محدودکننده را تغییر دهید.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-cinema-pill bg-kadr-primary text-white text-xs font-bold hover:bg-kadr-primary-hover transition-colors"
          >
            بازگشت به خانه و جستجوی جدید
          </button>
        </div>
      )}

    </div>
  );
};
