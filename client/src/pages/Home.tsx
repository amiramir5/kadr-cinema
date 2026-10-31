import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, SlidersHorizontal, Play, Star, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { MediaItem } from '../types';
import { KadrApi } from '../services/api';

const QUICK_PROMPTS = [
  'به فیلم علمی‌تخیلی',
  'به سریال دارک و مرموز',
  'فیلمی شبیه Interstellar',
  'یه کمدی بامزه',
  'انیمه خیلی فان همش بخندم'
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    KadrApi.getTrending()
      .then(res => {
        const list = res.results || [];
        setTrending(list);
        const inception = list.find(i => i.id === 1375666) || list[0];
        setFeaturedItem(inception);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    navigate(`/discover?q=${encodeURIComponent(prompt.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Top Welcome Title matching reference image */}
      <div className="pt-2 text-right">
        <h1 className="text-3xl sm:text-4xl font-black text-kadr-text tracking-tight font-vazir leading-tight">
          <span className="text-kadr-primary font-black">کادر،</span> دستیار هوشمند سینمای تو
        </h1>
        <p className="text-kadr-text-muted text-sm sm:text-base mt-2 font-medium">
          فقط کافیه چیزی که دوست داری رو بگی... بقیه‌اش با ما!
        </p>
        <div className="w-24 h-1 bg-kadr-primary/80 rounded-full mt-3 mr-auto ml-0 sm:mr-0 opacity-80" />
      </div>

      {/* Main Hero Card with 3D Robot & Search Input */}
      <div className="relative bg-[#F9F7F2] border border-kadr-border rounded-cinema-lg p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* 3D Robot Mascot & Bubble */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Robot 3D SVG Illustration */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
                {/* Robot Head */}
                <rect x="25" y="20" width="70" height="60" rx="24" fill="#E8EDF2" stroke="#CBD5E1" strokeWidth="2"/>
                {/* Antennas */}
                <rect x="56" y="8" width="8" height="14" rx="4" fill="#9E3039"/>
                <circle cx="60" cy="8" r="6" fill="#F39C12"/>
                {/* Ears / Headset */}
                <rect x="15" y="36" width="12" height="28" rx="6" fill="#1C1E21"/>
                <rect x="93" y="36" width="12" height="28" rx="6" fill="#1C1E21"/>
                {/* Screen / Visor */}
                <rect x="33" y="30" width="54" height="38" rx="14" fill="#1C1E21"/>
                {/* Cute Glowing Eyes */}
                <ellipse cx="48" cy="48" rx="6" ry="8" fill="#4ECA96"/>
                <ellipse cx="72" cy="48" rx="6" ry="8" fill="#4ECA96"/>
                <ellipse cx="50" cy="45" rx="2" ry="3" fill="#FFFFFF"/>
                <ellipse cx="74" cy="45" rx="2" ry="3" fill="#FFFFFF"/>
                {/* Popcorn Bucket in hands */}
                <path d="M42 80 L78 80 L72 108 L48 108 Z" fill="#C0392B"/>
                <path d="M45 80 L52 80 L50 108 L48 108 Z" fill="#FFFFFF"/>
                <path d="M59 80 L65 80 L63 108 L61 108 Z" fill="#FFFFFF"/>
                {/* Popcorns */}
                <circle cx="50" cy="76" r="5" fill="#F4D03F"/>
                <circle cx="60" cy="74" r="6" fill="#F4D03F"/>
                <circle cx="70" cy="76" r="5" fill="#F4D03F"/>
                <circle cx="55" cy="71" r="5" fill="#FFF9C4"/>
                <circle cx="65" cy="71" r="5" fill="#FFF9C4"/>
              </svg>
            </div>

            {/* Speech Bubble */}
            <div className="relative bg-white/95 border border-kadr-border/80 rounded-2xl px-4 py-3 shadow-sm text-xs sm:text-sm text-kadr-text max-w-xs leading-relaxed">
              <span className="font-bold text-kadr-primary block mb-0.5">سلام! 🍿</span>
              فیلم یا سریالی دوست داری ببینی؟ مثلاً بگو: «یه انیمه فان که همش بخندم»
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-white" />
            </div>
          </div>

          {/* Prompt Search Input Field */}
          <div className="w-full flex-1">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="درخواست خودت رو بنویس..."
                className="w-full py-4 pr-6 pl-28 bg-white border-2 border-kadr-border rounded-full text-sm sm:text-base text-kadr-text placeholder-kadr-text-muted focus:outline-none focus:border-kadr-primary shadow-sm transition-all"
              />

              {/* Action Buttons inside Input */}
              <div className="absolute left-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/discover')}
                  className="p-2.5 rounded-full text-kadr-text-muted hover:text-kadr-primary hover:bg-kadr-primary-light transition-colors"
                  title="فیلترهای پیشرفته"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-10 h-10 rounded-full bg-kadr-primary hover:bg-kadr-primary-hover disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4 -rotate-90 ml-0.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-6 pt-5 border-t border-kadr-border/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-kadr-text flex items-center gap-1.5 ml-2">
            <Zap className="w-3.5 h-3.5 text-kadr-primary fill-kadr-primary" />
            پیشنهادهای سریع:
          </span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(q);
                navigate(`/discover?q=${encodeURIComponent(q)}`);
              }}
              className="pill-chip"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Special Featured Section: «پیشنهاد ویژه برای تو» matching reference */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-kadr-primary text-lg">★</span>
            <h2 className="text-lg sm:text-xl font-bold text-kadr-text font-vazir">پیشنهاد ویژه برای تو</h2>
            <span className="text-xs text-kadr-text-muted hidden sm:inline mr-2">بر اساس سلیقه‌ات، فیلم‌هایی که دوستشون داری و درخواست‌هات</span>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-1 text-xs font-bold text-kadr-text-muted hover:text-kadr-primary transition-colors border border-kadr-border px-3 py-1.5 rounded-full bg-white"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Wide Banner (Inception) + Side Poster (Breaking Bad) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Dark Horizontal Hero Card */}
          {featuredItem && (
            <div className="lg:col-span-2 hero-dark-card p-6 sm:p-7 flex flex-col justify-between shadow-card relative overflow-hidden group">
              {/* Background Backdrop Image */}
              <div className="absolute inset-0 z-0 opacity-25 group-hover:scale-105 transition-transform duration-700">
                <img
                  src={featuredItem.backdropPath || featuredItem.posterPath || ''}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#1C1E21] via-[#1C1E21]/90 to-transparent" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-kadr-primary text-white shadow-sm flex items-center gap-1">
                    <span>۹۴٪ تطابق با سلیقه شما</span>
                  </span>
                  <span className="text-xs text-white/70 font-latin font-medium">{featuredItem.releaseYear} • {featuredItem.genres.slice(0, 3).join(', ')}</span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-latin">
                    {featuredItem.originalTitle || featuredItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-2 leading-relaxed max-w-xl">
                    {featuredItem.overviewFa || featuredItem.overview}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => navigate(`/title/${featuredItem.mediaType}/${featuredItem.id}`)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-kadr-primary hover:bg-kadr-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>مشاهده جزئیات و تریلر</span>
                </button>

                <div className="flex items-center gap-4 text-xs text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white text-sm">{featuredItem.voteAverage}</span>
                    <span>/10</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">دلیل پیشنهاد: علاقه به داستان‌های عمیق و پرکشش</span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Poster (Breaking Bad) matching reference */}
          {trending.length > 1 && (
            <div
              onClick={() => navigate(`/title/${trending[1].mediaType}/${trending[1].id}`)}
              className="relative aspect-[3/4] sm:aspect-auto rounded-cinema-lg overflow-hidden border border-kadr-border shadow-card cursor-pointer group"
            >
              <img
                src={trending[1].posterPath || ''}
                alt={trending[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {trending[1].voteAverage}
                </span>
                <h4 className="font-bold text-base font-latin line-clamp-1">{trending[1].title}</h4>
                <p className="text-xs text-white/75 mt-0.5">{trending[1].titleFa}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Row of Trending Media Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base sm:text-lg text-kadr-text font-vazir">منتخب روز</h3>
          <span className="text-xs text-kadr-text-muted">برترین عناوین سینمایی و انیمه</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.slice(2, 7).map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/title/${item.mediaType}/${item.id}`)}
              className="warm-card overflow-hidden cursor-pointer group flex flex-col"
            >
              <div className="aspect-[2/3] w-full overflow-hidden bg-kadr-card relative">
                <img
                  src={item.posterPath || './placeholder-poster.svg'}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = './placeholder-poster.svg';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.voteAverage}</span>
                </div>
              </div>
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-kadr-text group-hover:text-kadr-primary transition-colors line-clamp-1">
                    {item.titleFa || item.title}
                  </h4>
                  <p className="text-[11px] text-kadr-text-muted font-latin line-clamp-1 mt-0.5">{item.title}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-kadr-border/70 flex items-center justify-between text-[11px] text-kadr-text-muted">
                  <span>{item.releaseYear}</span>
                  <span className="text-kadr-primary font-medium">{item.genres[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
