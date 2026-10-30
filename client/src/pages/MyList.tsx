import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, CheckCircle2, Circle, Heart, Trash2, Star, Search, Sparkles, Film, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getPosterUrl } from '../services/api';
import { UserSavedItem } from '../types';

export const MyList: React.FC = () => {
  const navigate = useNavigate();
  const { savedItems, stats, changeItemStatus, removeItem } = useUser();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'watched' | 'favorite'>('watchlist');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter items for current tab
  const tabItems = savedItems.filter(item => {
    if (item.listType !== activeTab) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.titleFa && item.titleFa.toLowerCase().includes(q))
    );
  });

  const handleToggleWatched = (item: UserSavedItem) => {
    if (item.listType === 'watched') {
      changeItemStatus(item.id, item.mediaType, 'watchlist');
    } else {
      changeItemStatus(item.id, item.mediaType, 'watched');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Editorial Title */}
      <div className="space-y-1 text-center sm:text-right">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-kadr-text">لیست سینمایی من</h1>
        <p className="text-xs text-kadr-text-muted">آرشیو شخصی عناوینی که می‌خواهید ببینید یا دیده‌اید</p>
      </div>

      {/* User Stats Bar (Matching reference mockup statistics cards!) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
          <div className="text-xl sm:text-2xl font-black text-kadr-primary font-latin">{stats.moviesWatched}</div>
          <div className="text-[11px] text-kadr-text-muted mt-0.5">فیلم دیده‌شده</div>
        </div>

        <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
          <div className="text-xl sm:text-2xl font-black text-kadr-primary font-latin">{stats.seriesWatched}</div>
          <div className="text-[11px] text-kadr-text-muted mt-0.5">سریال دنبال‌شده</div>
        </div>

        <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
          <div className="text-xl sm:text-2xl font-black text-kadr-accent font-latin">{stats.inWatchlist}</div>
          <div className="text-[11px] text-kadr-text-muted mt-0.5">در لیست تماشا</div>
        </div>
      </div>

      {/* Main Tabs (تماشای بعد, دیده‌شده‌ها, علاقه‌مندی‌ها) */}
      <div className="flex items-center justify-between border-b border-kadr-border pb-3">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'watchlist'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            تماشای بعد ({savedItems.filter(i => i.listType === 'watchlist').length})
          </button>

          <button
            onClick={() => setActiveTab('watched')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'watched'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            دیده‌شده‌ها ({savedItems.filter(i => i.listType === 'watched').length})
          </button>

          <button
            onClick={() => setActiveTab('favorite')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'favorite'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            علاقه‌مندی‌ها ({savedItems.filter(i => i.listType === 'favorite').length})
          </button>
        </div>

        {/* In-list Search Filter */}
        <div className="relative w-36 sm:w-56">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="فیلتر در لیست..."
            className="w-full bg-kadr-surface border border-kadr-border rounded-cinema-pill px-3 py-1 pr-7 text-xs text-kadr-text outline-none focus:border-kadr-primary"
          />
          <Search className="w-3.5 h-3.5 text-kadr-text-muted absolute right-2.5 top-2" />
        </div>
      </div>

      {/* Items List (Rows matching the clean checklist design in the mockup!) */}
      {tabItems.length > 0 ? (
        <div className="space-y-3">
          {tabItems.map(item => {
            const isItemWatched = item.listType === 'watched';
            const displayTitle = item.titleFa || item.title;

            return (
              <div
                key={`${item.mediaType}_${item.id}`}
                className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border hover:border-kadr-border-hover flex items-center justify-between gap-4 transition-all shadow-cinema-subtle"
              >
                {/* Right: Poster & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  
                  {/* Status Toggle Radio (circle check from mockup!) */}
                  <button
                    onClick={() => handleToggleWatched(item)}
                    className="p-1 text-kadr-text-muted hover:text-kadr-primary transition-colors flex-shrink-0"
                    title={isItemWatched ? 'انتقال به تماشای بعد' : 'علامت به عنوان دیده‌شده'}
                  >
                    {isItemWatched ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-kadr-border-hover hover:border-kadr-primary" />
                    )}
                  </button>

                  {/* Thumbnail Poster */}
                  <Link
                    to={`/title/${item.mediaType}/${item.id}`}
                    className="w-12 h-16 sm:w-14 sm:h-20 rounded-md overflow-hidden bg-kadr-bg border border-kadr-border flex-shrink-0 block"
                  >
                    <img
                      src={getPosterUrl(item.posterPath, 'w342')}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
                      }}
                    />
                  </Link>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <Link to={`/title/${item.mediaType}/${item.id}`} className="block">
                      <h3 className="font-bold text-sm text-kadr-text hover:text-kadr-primary transition-colors truncate">
                        {displayTitle}
                      </h3>
                      {item.title && item.title !== displayTitle && (
                        <p className="text-[11px] font-latin text-kadr-text-muted truncate" dir="ltr">
                          {item.title}
                        </p>
                      )}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-kadr-text-muted mt-1">
                      <span>{item.mediaType === 'movie' ? 'فیلم' : 'سریال'}</span>
                      {item.releaseYear > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-latin">{item.releaseYear}</span>
                        </>
                      )}
                      {item.numberOfSeasons && (
                        <>
                          <span>•</span>
                          <span>{item.numberOfSeasons} فصل</span>
                        </>
                      )}
                      {item.userRating && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-bold font-latin">امتیاز شما: {item.userRating}/۱۰</span>
                        </>
                      )}
                    </div>

                    {item.userNote && (
                      <p className="text-[11px] text-kadr-accent bg-kadr-accent-light px-2 py-0.5 rounded mt-1.5 inline-block truncate max-w-md">
                        یادداشت: {item.userNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Left: Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(item.id, item.mediaType)}
                    className="p-2 text-kadr-text-muted hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                    title="حذف از لیست"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-kadr-surface rounded-cinema border border-kadr-border p-8 space-y-4">
          <Bookmark className="w-10 h-10 text-kadr-text-muted mx-auto stroke-1" />
          <h3 className="font-bold text-base text-kadr-text">لیست خالی است</h3>
          <p className="text-xs text-kadr-text-muted max-w-sm mx-auto">
            هنوز عنوانی در این بخش ثبت نکرده‌اید. می‌توانید با کشف هوشمند عناوینی که متناسب با سلیقه‌تان هستند را پیدا و ذخیره کنید.
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-2 px-5 py-2 rounded-cinema-pill bg-kadr-primary text-white text-xs font-bold mx-auto hover:bg-kadr-primary-hover transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>شروع کشف هوشمند</span>
          </button>
        </div>
      )}

    </div>
  );
};
