import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, X, SlidersHorizontal, ChevronLeft, ChevronRight, Play, Star, Clock } from 'lucide-react';
import { MediaItem } from '../types';
import { KadrApi, getBackdropUrl } from '../services/api';
import { MediaCard } from '../components/MediaCard';
import { useUser } from '../context/UserContext';

const EXAMPLE_PROMPTS = [
  'یه فیلم معمایی میخوام که تا آخرش نتونم قاتل رو حدس بزنم.',
  'یه سریال کمدی با قسمت‌های کوتاه برای آخر شب پیشنهاد بده.',
  'یه چیزی شبیه Interstellar ولی احساسی‌تر.',
  'یه فیلم امیدوارکننده و خوش‌ساخت، بدون کلیشه‌های عاشقانه.',
  'یه فیلم ترسناک واقعاً دلهره‌آور بدون جامپ‌اسکر زیاد.',
  'یه مینی‌سریال جنایی با امتیاز بالا و فقط یک فصل.',
];

const GENRES_LIST = [
  { id: 28, nameFa: 'اکشن', icon: '🎬', desc: 'هیجان و آدرنالین' },
  { id: 35, nameFa: 'کمدی', icon: '😄', desc: 'حال خوب و خنده' },
  { id: 9648, nameFa: 'رازآلود', icon: '🔮', desc: 'معماهای پیچیده' },
  { id: 27, nameFa: 'ترسناک', icon: '💀', desc: 'وحشت و تعلیق' },
  { id: 878, nameFa: 'علمی‌تخیلی', icon: '🚀', desc: 'سفر در زمان و فضا' },
  { id: 10749, nameFa: 'عاشقانه', icon: '💕', desc: 'روایت‌های احساسی' },
  { id: 18, nameFa: 'درام', icon: '🎭', desc: 'عمیق و تأثیرگذار' },
  { id: 16, nameFa: 'انیمیشن', icon: '🌀', desc: 'دنیای رنگارنگ' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { searchHistory, addSearchHistory } = useUser();

  const [prompt, setPrompt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxRuntime, setMaxRuntime] = useState<number | undefined>(undefined);

  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    KadrApi.getTrending()
      .then(res => {
        setTrending(res.results || []);
        if (res.results && res.results.length > 0) {
          const featured = res.results.find(i => i.id === 693134) || res.results[0];
          setFeaturedItem(featured);
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

  const handleGenreClick = (genreId: number) => {
    navigate(`/explore?genre=${genreId}`);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-8 pb-12 overflow-hidden hero-grid">
        
        {/* Large Radial Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-[#7c6af7]/20 via-[#f97b6b]/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs text-white/80 shadow-glass">
            <Sparkles className="w-4 h-4 text-[#f97b6b]" />
            <span>جستجوی معنایی هوشمند با Gemini</span>
          </div>

          {/* Persian Big Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-vazir bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-[#7c6af7] drop-shadow-[0_0_35px_rgba(124,106,247,0.4)]">
            امشب، چی بهت می‌چسبه؟
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            حال‌وهوا، سلیقه یا داستان مورد نظرت رو به زبان خودت بنویس؛ هوش مصنوعی دقیقاً اثر متناسب با مود امشبت رو پیشنهاد میده.
          </p>

          {/* LARGE Glass Search Box */}
          <div className="mt-8 bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-white/15 focus-within:border-[#7c6af7]/70 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] focus-within:shadow-[0_0_40px_rgba(124,106,247,0.35)] transition-all text-right">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثلاً: یه فیلم معمایی هیجان‌انگیز بدون صحنه‌های دلخراش، ترجیحاً زیر دو ساعت و با پایانی شوکه‌کننده..."
                rows={3}
                className="w-full bg-transparent resize-none border-none outline-none text-white placeholder:text-white/35 text-base sm:text-lg leading-relaxed pr-2 pl-12"
              />

              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="absolute left-2 top-2 p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  title="پاک کردن"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Prompt Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/10 mt-2">
              
              {/* Optional Filters Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  showFilters || mediaType !== 'all' || minRating || maxRuntime
                    ? 'bg-[#7c6af7]/20 text-[#7c6af7] border border-[#7c6af7]/40 shadow-glow-primary'
                    : 'text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>فیلترهای اختیاری</span>
                {(mediaType !== 'all' || minRating || maxRuntime) && (
                  <span className="w-2 h-2 rounded-full bg-[#f97b6b]" />
                )}
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-gradient-to-r from-[#7c6af7] to-[#6a58e5] text-white text-sm font-bold shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>کشف کن</span>
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Expandable Optional Filter Panel */}
            {showFilters && (
              <div className="pt-4 mt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
                {/* Media Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/50">نوع اثر:</label>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/10">
                    <button
                      type="button"
                      onClick={() => setMediaType('all')}
                      className={`flex-1 py-1 rounded-full text-xs font-medium transition-colors ${
                        mediaType === 'all' ? 'bg-[#7c6af7] text-white font-bold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      همه
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('movie')}
                      className={`flex-1 py-1 rounded-full text-xs font-medium transition-colors ${
                        mediaType === 'movie' ? 'bg-[#7c6af7] text-white font-bold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      فیلم
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('tv')}
                      className={`flex-1 py-1 rounded-full text-xs font-medium transition-colors ${
                        mediaType === 'tv' ? 'bg-[#7c6af7] text-white font-bold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      سریال
                    </button>
                  </div>
                </div>

                {/* Min Rating */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/50">حداقل امتیاز:</label>
                  <select
                    value={minRating || ''}
                    onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-[#12122a] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white outline-none focus:border-[#7c6af7]"
                  >
                    <option value="">بدون شرط امتیاز</option>
                    <option value="7.0">امتیاز ۷.۰ به بالا</option>
                    <option value="7.5">امتیاز ۷.۵ به بالا</option>
                    <option value="8.0">امتیاز ۸.۰ به بالا (شاهکارها)</option>
                    <option value="8.5">امتیاز ۸.۵ به بالا</option>
                  </select>
                </div>

                {/* Max Runtime */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/50">حداکثر مدت زمان:</label>
                  <select
                    value={maxRuntime || ''}
                    onChange={(e) => setMaxRuntime(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full bg-[#12122a] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white outline-none focus:border-[#7c6af7]"
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
          <div className="text-right pt-2">
            <span className="text-xs text-white/40 ml-2">نمونه درخواست‌ها:</span>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              {EXAMPLE_PROMPTS.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#7c6af7]/50 hover:bg-[#7c6af7]/10 text-xs text-white/70 hover:text-white transition-all backdrop-blur-md shadow-glass"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* GENRE SECTION: Grid of 3D Emoji Glass Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-right mb-6">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <Sparkles className="w-4 h-4 text-[#f97b6b]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-vazir">دسته‌بندی‌ها و ژانرها</h2>
          </div>
          <p className="text-xs sm:text-sm text-white/40">برای مرور آثار هر ژانر یکی را انتخاب کنید</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {GENRES_LIST.map((genre) => (
            <div
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-[#7c6af7]/50 backdrop-blur-xl shadow-glass hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(124,106,247,0.25)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer text-center"
            >
              <span className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                {genre.icon}
              </span>
              <span className="text-sm font-bold text-white group-hover:text-[#7c6af7] transition-colors">
                {genre.nameFa}
              </span>
              <span className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                {genre.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SPOTLIGHT BANNER */}
      {featuredItem && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-black">
              {featuredItem.backdropPath && (
                <img
                  src={getBackdropUrl(featuredItem.backdropPath, 'original')}
                  alt={featuredItem.titleFa || featuredItem.title}
                  className="w-full h-full object-cover object-center opacity-70 transition-transform duration-700 hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-transparent" />

              <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-10 text-white flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
                <div className="space-y-2.5 text-right max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#f5c842] text-black text-xs font-latin font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span>{featuredItem.voteAverage}</span>
                    </span>
                    <span className="text-xs text-white/80 font-latin">{featuredItem.releaseYear}</span>
                    {featuredItem.runtime && <span className="text-xs text-white/80">• {featuredItem.runtime} دقیقه</span>}
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {featuredItem.titleFa || featuredItem.title}
                  </h3>

                  {featuredItem.originalTitle && (
                    <p className="text-xs sm:text-sm text-white/60 font-latin" dir="ltr">
                      {featuredItem.originalTitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed font-light">
                    {featuredItem.overviewFa || featuredItem.overview}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => navigate(`/title/${featuredItem.mediaType}/${featuredItem.id}`)}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#7c6af7] to-[#6a58e5] text-white text-sm font-bold shadow-glow-primary transition-transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>مشاهده جزئیات اثر</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TRENDING SECTION: محبوب‌ترین‌ها */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-vazir">محبوب‌ترین‌ها</h2>
            <p className="text-xs sm:text-sm text-white/40 mt-1">منتخب فیلم‌ها و سریال‌های پرطرفدار کادر</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-1 text-xs font-bold text-[#7c6af7] hover:underline"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal scroll row of MediaCards */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x">
          {trending.map(media => (
            <div key={media.id} className="w-48 sm:w-56 flex-shrink-0 snap-start">
              <MediaCard media={media} />
            </div>
          ))}
        </div>
      </section>

      {/* RECENT SEARCHES SECTION */}
      {searchHistory.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white">جستجوهای اخیر شما</h3>
              <span className="text-xs text-white/40">ذخیره روی مرورگر شما</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {searchHistory.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/discover?q=${encodeURIComponent(item.prompt)}`)}
                  className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/80 hover:border-[#7c6af7]/50 hover:text-white transition-all flex items-center gap-2 hover:bg-[#7c6af7]/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f97b6b]" />
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
