import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, SlidersHorizontal, RefreshCw, Film, Tv, Smile, Ghost, Heart, Flame, Compass as AdventureIcon, Atom, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { KadrApi } from '../services/api';
import { MediaCard } from '../components/MediaCard';

// Visual Genre Grid items matching reference design!
const VISUAL_GENRES = [
  { id: 28, name: 'اکشن', en: 'Action', icon: Flame, bg: 'bg-[#EAF3EE] text-[#355E4B] border-[#D1E5DA]' },
  { id: 18, name: 'درام', en: 'Drama', icon: Sparkles, bg: 'bg-[#FDF3EE] text-[#C8795A] border-[#F6DECE]' },
  { id: 35, name: 'کمدی', en: 'Comedy', icon: Smile, bg: 'bg-[#EEF4FB] text-[#3D7199] border-[#D5E5F4]' },
  { id: 27, name: 'ترسناک', en: 'Horror', icon: Ghost, bg: 'bg-[#FBECEE] text-[#9E3E4B] border-[#F4D3D7]' },
  { id: 878, name: 'علمی‌تخیلی', en: 'Sci-Fi', icon: Atom, bg: 'bg-[#EBF7F7] text-[#2F7E7E] border-[#D0EEEE]' },
  { id: 10749, name: 'عاشقانه', en: 'Romance', icon: Heart, bg: 'bg-[#FBECF2] text-[#A63A69] border-[#F4D0E1]' },
  { id: 16, name: 'انیمه / کارتون', en: 'Anime', icon: Film, bg: 'bg-[#F3EEFA] text-[#6E429B] border-[#E2D4F3]' },
  { id: 12, name: 'ماجراجویی', en: 'Adventure', icon: AdventureIcon, bg: 'bg-[#EEF7F2] text-[#3D7A5C] border-[#D3ECD9]' },
];

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>((searchParams.get('type') as any) || 'all');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    searchParams.get('genre') ? parseInt(searchParams.get('genre')!, 10) : null
  );
  const [minRating, setMinRating] = useState<number | null>(
    searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : null
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'popularity.desc');

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (query.trim()) {
        const res = await KadrApi.search(query.trim());
        let filtered = res.results;
        if (activeTab !== 'all') {
          filtered = filtered.filter(i => i.mediaType === activeTab);
        }
        if (selectedGenre) {
          filtered = filtered.filter(i => i.genreIds.includes(selectedGenre));
        }
        if (minRating) {
          filtered = filtered.filter(i => i.voteAverage >= minRating);
        }
        setResults(filtered);
        setTotalFound(filtered.length);
      } else {
        const res = await KadrApi.explore({
          type: activeTab,
          genre: selectedGenre || undefined,
          minRating: minRating || undefined,
          sortBy,
        });
        setResults(res.results);
        setTotalFound(res.total);
      }
    } catch (err) {
      console.error('Explore failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [query, activeTab, selectedGenre, minRating, sortBy]);

  const handleGenreClick = (id: number) => {
    if (selectedGenre === id) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="text-center sm:text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-kadr-text">جستجو و کاوش در سینما</h1>
          <p className="text-xs sm:text-sm text-kadr-text-muted mt-1">
            کاوش دسته‌بندی‌شده در هزاران عنوان سینمایی و تلویزیونی با متادیتای واقعی
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی نام فیلم، سریال، کارگردان یا عنوان اصلی..."
            className="w-full bg-kadr-surface border border-kadr-border rounded-cinema-pill px-5 py-3 pr-11 text-sm text-kadr-text outline-none focus:border-kadr-primary shadow-cinema-subtle transition-all"
          />
          <Search className="w-5 h-5 text-kadr-text-muted absolute right-4 top-3.5" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-4 top-3.5 text-xs text-kadr-text-muted hover:text-kadr-text font-bold"
            >
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* Visual Genre Grid (Matching reference screenshot exactly!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-kadr-text">ژانرها و جهان‌ها</h2>
          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-xs text-kadr-accent hover:underline font-bold"
            >
              پاک کردن فیلتر ژانر
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VISUAL_GENRES.map(g => {
            const Icon = g.icon;
            const isSelected = selectedGenre === g.id;

            return (
              <button
                key={g.id}
                onClick={() => handleGenreClick(g.id)}
                className={`flex items-center justify-between p-3.5 rounded-cinema border transition-all ${
                  isSelected
                    ? 'ring-2 ring-kadr-primary border-kadr-primary scale-[1.02] shadow-cinema-subtle'
                    : 'hover:shadow-cinema-subtle hover:scale-[1.01]'
                } ${g.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm block">{g.name}</span>
                    <span className="text-[10px] opacity-75 font-latin">{g.en}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Type Tabs & Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-kadr-border pb-4">
        
        {/* Media Tabs (همه, فیلم, سریال) */}
        <div className="flex items-center gap-1 bg-kadr-surface p-1 rounded-cinema-pill border border-kadr-border text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              activeTab === 'all' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-4 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              activeTab === 'movie' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            فیلم
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-1.5 rounded-cinema-pill font-medium transition-colors ${
              activeTab === 'tv' ? 'bg-kadr-primary text-white shadow-sm' : 'text-kadr-text hover:bg-kadr-bg'
            }`}
          >
            سریال
          </button>
        </div>

        {/* Rating and Sort Dropdowns */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={minRating || ''}
            onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
            className="bg-kadr-surface border border-kadr-border rounded-cinema-pill px-3 py-1.5 text-xs text-kadr-text outline-none focus:border-kadr-primary"
          >
            <option value="">حداقل امتیاز</option>
            <option value="7">امتیاز ۷+</option>
            <option value="7.5">امتیاز ۷.۵+</option>
            <option value="8">امتیاز ۸+</option>
            <option value="8.5">امتیاز ۸.۵+</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-kadr-surface border border-kadr-border rounded-cinema-pill px-3 py-1.5 text-xs text-kadr-text outline-none focus:border-kadr-primary"
          >
            <option value="popularity.desc">محبوب‌ترین</option>
            <option value="vote_average.desc">بالاترین امتیاز</option>
            <option value="primary_release_date.desc">جدیدترین</option>
          </select>
        </div>

      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="aspect-[2/3] bg-kadr-surface rounded-cinema border border-kadr-border animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(media => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-kadr-surface rounded-cinema border border-kadr-border p-8 space-y-3">
          <Compass className="w-10 h-10 text-kadr-text-muted mx-auto stroke-1" />
          <h3 className="font-bold text-sm text-kadr-text">موردی یافت نشد</h3>
          <p className="text-xs text-kadr-text-muted">لطفاً فیلترهای خود را تغییر دهید یا عبارت دیگری را جستجو کنید.</p>
        </div>
      )}

    </div>
  );
};
