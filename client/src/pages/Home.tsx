import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, X, SlidersHorizontal, Play, Star, ChevronLeft, Film, Tv, Clock, Compass } from 'lucide-react';
import { MediaItem } from '../types';
import { KadrApi, getBackdropUrl } from '../services/api';
import { MediaCard } from '../components/MediaCard';
import { useUser } from '../context/UserContext';

const EXAMPLE_PROMPTS = [
  'یه فیلم معمایی میخوام که تا آخرش نتونم قاتل رو حدس بزنم.',
  'یه سریال کمدی با قسمتهای کوتاه برای آخر شب پیشنهاد بده.',
  'یه چیزی شبیه Interstellar ولی احساسیتر.',
  'یه فیلم امیدوارکننده و خوشساخت، بدون کلیشههای عاشقانه.',
  'یه فیلم ترسناک واقعاً دلهرهآور بدون جامپاسکر زیاد.',
  'یه مینیسریال جنایی با امتیاز بالا و فقط یک فصل.',
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { searchHistory, addSearchHistory } = useUser();

  const [prompt, setPrompt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxRuntime, setMaxRuntime] = useState<number | undefined>(undefined);

  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    KadrApi.getTrending()
      .then(res => {
        setTrending(res.results || []);
        if (res.results && res.results.length > 0) {
          // Feature Dune: Part Two or first item
          const dune = res.results.find(i => i.id === 693134) || res.results[0];
          setFeaturedItem(dune);
        }
      })
      .catch(err => console.error('Failed to load trending:', err));
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    addSearchHistory(prompt.trim(), 0);

    const queryParams = new URLSearchParams();
    queryParams.set('q', prompt.trim());
    if (mediaType !== 'all') queryParams.set('type', mediaType);
    if (selectedGenre) queryParams.set('genre', selectedGenre.toString());
    if (minRating) queryParams.set('minRating', minRating.toString());
    if (maxRuntime) queryParams.set('runtime', maxRuntime.toString());

    navigate(`/discover?${queryParams.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectExample = (ex: string) => {
    setPrompt(ex);
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Discovery Section */}
      <section className="relative pt-6 sm:pt-12 max-w-4xl mx-auto px-4 text-center">
        
        {/* Editorial Heading */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-cinema-pill bg-kadr-primary-light text-kadr-primary text-xs font-medium border border-kadr-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-kadr-accent" />
            <span>پیشنهادهای هوشمند، فراتر از ژانرهای مرسوم</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-kadr-text tracking-tight font-vazir">
            امشب، چی بهت میچسبه؟
          </h1>

          <p className="text-kadr-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            حال‌وهواتو بگو؛ ما چیزی پیدا می‌کنیم که واقعاً بهت بچسبه.
            بر اساس حس، داستان، زمان و سلیقه خاص خودت.
          </p>
        </div>

        {/* Natural Language Prompt Input Box */}
        <div className="bg-kadr-surface rounded-cinema-lg p-3 sm:p-4 border border-kadr-border shadow-cinema-card focus-within:border-kadr-primary focus-within:ring-2 focus-within:ring-kadr-primary/10 transition-all text-right">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="مثلاً: یه فیلم معمایی هیجان‌انگیز بدون صحنه‌های دلخراش، ترجیحاً زیر دو ساعت..."
              rows={3}
              className="w-full bg-transparent resize-none border-none outline-none text-kadr-text placeholder:text-kadr-text-muted/60 text-sm sm:text-base leading-relaxed pr-2 pl-12"
            />

            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute left-2 top-2 p-1 text-kadr-text-muted hover:text-kadr-text rounded-full hover:bg-kadr-bg transition-colors"
                title="پاک کردن متن"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Prompt Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-kadr-border/70 mt-2">
            
            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-cinema-pill text-xs font-medium transition-colors ${
                showFilters || mediaType !== 'all' || minRating || maxRuntime
                  ? 'bg-kadr-primary-light text-kadr-primary border border-kadr-primary/30'
                  : 'text-kadr-text-muted hover:text-kadr-text hover:bg-kadr-bg border border-kadr-border'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلترهای اختیاری</span>
              {(mediaType !== 'all' || minRating || maxRuntime) && (
                <span className="w-2 h-2 rounded-full bg-kadr-accent" />
              )}
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-2 px-6 py-2 rounded-cinema-pill bg-kadr-primary hover:bg-kadr-primary-hover text-white text-sm font-bold shadow-cinema-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>پیدا کن</span>
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Expandable Optional Filter Panel */}
          {showFilters && (
            <div className="pt-4 mt-3 border-t border-kadr-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
              {/* Media Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-kadr-text-muted">نوع اثر:</label>
                <div className="flex items-center gap-1 bg-kadr-bg p-1 rounded-cinema-pill border border-kadr-border">
                  <button
                    type="button"
                    onClick={() => setMediaType('all')}
                    className={`flex-1 py-1 rounded-cinema-pill text-xs font-medium transition-colors ${
                      mediaType === 'all' ? 'bg-kadr-surface text-kadr-primary shadow-sm font-bold' : 'text-kadr-text-muted'
                    }`}
                  >
                    هر دو
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('movie')}
                    className={`flex-1 py-1 rounded-cinema-pill text-xs font-medium transition-colors ${
                      mediaType === 'movie' ? 'bg-kadr-surface text-kadr-primary shadow-sm font-bold' : 'text-kadr-text-muted'
                    }`}
                  >
                    فیلم
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('tv')}
                    className={`flex-1 py-1 rounded-cinema-pill text-xs font-medium transition-colors ${
                      mediaType === 'tv' ? 'bg-kadr-surface text-kadr-primary shadow-sm font-bold' : 'text-kadr-text-muted'
                    }`}
                  >
                    سریال
                  </button>
                </div>
              </div>

              {/* Min Rating */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-kadr-text-muted">حداقل امتیاز بینندگان:</label>
                <select
                  value={minRating || ''}
                  onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-kadr-bg border border-kadr-border rounded-cinema-pill px-3 py-1.5 text-xs text-kadr-text outline-none focus:border-kadr-primary"
                >
                  <option value="">هر امتیازی</option>
                  <option value="7.0">امتیاز ۷.۰ به بالا</option>
                  <option value="7.5">امتیاز ۷.۵ به بالا</option>
                  <option value="8.0">امتیاز ۸.۰ به بالا (شاهکارها)</option>
                  <option value="8.5">امتیاز ۸.۵ به بالا</option>
                </select>
              </div>

              {/* Max Runtime */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-kadr-text-muted">حداکثر زمان اثر:</label>
                <select
                  value={maxRuntime || ''}
                  onChange={(e) => setMaxRuntime(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-full bg-kadr-bg border border-kadr-border rounded-cinema-pill px-3 py-1.5 text-xs text-kadr-text outline-none focus:border-kadr-primary"
                >
                  <option value="">بدون محدودیت زمان</option>
                  <option value="90">زیر ۹۰ دقیقه (کوتاه و جمع‌وجور)</option>
                  <option value="120">زیر ۲ ساعت (استاندارد)</option>
                  <option value="35">قسمت‌های کوتاه سریال (زیر ۳۵ دقیقه)</option>
                </select>
              </div>
            </div>
          )}

        </div>

        {/* Suggestion Example Pills */}
        <div className="mt-4 text-right">
          <span className="text-xs text-kadr-text-muted ml-2">چند پیشنهاد آماده:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {EXAMPLE_PROMPTS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectExample(ex)}
                className="px-3 py-1.5 rounded-cinema-pill bg-kadr-surface border border-kadr-border hover:border-kadr-primary hover:text-kadr-primary text-xs text-kadr-text transition-all shadow-cinema-subtle hover:scale-[1.01]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Featured Spotlight Section (Matching reference Dune: Part Two editorial card!) */}
      {featuredItem && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kadr-accent" />
              <h2 className="text-lg font-bold text-kadr-text font-vazir">پیشنهاد امروز برای تو</h2>
            </div>
            <span className="text-xs text-kadr-text-muted font-latin">Spotlight Cinema</span>
          </div>

          <div className="relative rounded-cinema-lg overflow-hidden border border-kadr-border bg-kadr-surface shadow-cinema-card">
            
            {/* Backdrop Banner */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black">
              {featuredItem.backdropPath && (
                <img
                  src={getBackdropUrl(featuredItem.backdropPath, 'original')}
                  alt={featuredItem.titleFa || featuredItem.title}
                  className="w-full h-full object-cover object-center opacity-85"
                />
              )}
              {/* Cinema framing gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Floating Content inside Banner */}
              <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                <div className="space-y-2 text-right max-w-xl">
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-black text-xs font-latin font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span>{featuredItem.voteAverage}</span>
                    </span>
                    <span className="text-xs text-white/80 font-latin">{featuredItem.releaseYear}</span>
                    {featuredItem.runtime && <span className="text-xs text-white/80">• {featuredItem.runtime} دقیقه</span>}
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    {featuredItem.titleFa || featuredItem.title}
                  </h3>

                  {featuredItem.originalTitle && (
                    <p className="text-xs sm:text-sm text-white/70 font-latin" dir="ltr">
                      {featuredItem.originalTitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                    {featuredItem.overviewFa || featuredItem.overview}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/title/${featuredItem.mediaType}/${featuredItem.id}`)}
                    className="flex items-center gap-2 px-6 py-3 rounded-cinema-pill bg-kadr-primary hover:bg-kadr-primary-hover text-white text-sm font-bold shadow-lg transition-transform hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>معرفی و پخش تریلر</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* Curated Section 1: مناسب حال‌وهوای امروزت */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-kadr-text font-vazir">مناسب حال‌وهوای امروزت</h2>
            <p className="text-xs text-kadr-text-muted mt-1">گزیده‌ای از درام‌های عمیق، معماهای پیچیده و آثار تحسین‌شده</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-1 text-xs font-bold text-kadr-primary hover:underline"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.slice(0, 5).map(media => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      </section>

      {/* Curated Section 2: محبوب بین تماشاگرها */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-kadr-text font-vazir">محبوب بین تماشاگرها</h2>
            <p className="text-xs text-kadr-text-muted mt-1">عناوینی که این روزها بیشترین بحث و استقبال را به همراه داشته‌اند</p>
          </div>
          <button
            onClick={() => navigate('/explore?sortBy=vote_average.desc')}
            className="flex items-center gap-1 text-xs font-bold text-kadr-primary hover:underline"
          >
            <span>برترین امتیازها</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.slice(5, 10).map(media => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      </section>

      {/* Section 3: جستجوهای اخیر / ادامه کشف‌های قبلی */}
      {searchHistory.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-cinema bg-kadr-surface border border-kadr-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-kadr-text">ادامه کشف‌های قبلی شما</h3>
              <span className="text-xs text-kadr-text-muted">تاریخچه جستجو روی همین دستگاه ذخیره است</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/discover?q=${encodeURIComponent(item.prompt)}`)}
                  className="px-3.5 py-1.5 rounded-cinema-pill bg-kadr-bg border border-kadr-border text-xs text-kadr-text hover:border-kadr-primary hover:text-kadr-primary transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 text-kadr-accent" />
                  <span>{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
