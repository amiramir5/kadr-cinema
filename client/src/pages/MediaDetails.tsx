import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Bookmark, Heart, Check, Play, Film, Tv, Share2, Sparkles, MessageSquare, ChevronRight, X, ExternalLink } from 'lucide-react';
import { MediaDetail } from '../types';
import { KadrApi, getBackdropUrl, getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';
import { MediaCard } from '../components/MediaCard';

export const MediaDetails: React.FC = () => {
  const { mediaType = 'movie', id } = useParams<{ mediaType: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();

  const {
    addToWatchlist,
    addToFavorites,
    markAsWatched,
    removeItem,
    isSavedAs,
    getItemData,
    setItemRating,
    setItemNote,
  } = useUser();

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'notes' | 'similar'>('overview');
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Local user notes and rating input
  const [userNoteText, setUserNoteText] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [noteSaved, setNoteSaved] = useState(false);

  const numericId = id ? parseInt(id, 10) : 0;
  const isMovie = mediaType === 'movie';

  const inWatchlist = isSavedAs(numericId, mediaType, 'watchlist');
  const isFavorite = isSavedAs(numericId, mediaType, 'favorite');
  const isWatched = isSavedAs(numericId, mediaType, 'watched');

  useEffect(() => {
    if (!numericId) return;
    setLoading(true);
    setError(null);

    const fetchDetail = isMovie ? KadrApi.getMovie(numericId) : KadrApi.getTv(numericId);

    fetchDetail
      .then(res => {
        setMedia(res);
        // Load existing saved rating and note if present
        const savedData = getItemData(numericId, mediaType);
        if (savedData) {
          if (savedData.userRating) setSelectedRating(savedData.userRating);
          if (savedData.userNote) setUserNoteText(savedData.userNote);
        }
      })
      .catch(err => {
        console.error('Failed to load detail:', err);
        setError('یافتن اطلاعات این اثر با خطا مواجه شد.');
      })
      .finally(() => setLoading(false));
  }, [numericId, mediaType]);

  const handleSaveNote = () => {
    if (!media) return;
    setItemNote(numericId, mediaType, userNoteText);
    if (selectedRating > 0) {
      setItemRating(numericId, mediaType, selectedRating);
    }
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleRatingClick = (rate: number) => {
    setSelectedRating(rate);
    setItemRating(numericId, mediaType, rate);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-kadr-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-kadr-text-muted">در حال بارگذاری اطلاعات سینمایی...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm font-bold text-rose-700">{error || 'عنوان یافت نشد.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-cinema-pill bg-kadr-primary text-white text-xs font-bold"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const displayTitle = media.titleFa || media.title;
  const trailerVideo = media.videos?.find(v => v.type === 'Trailer') || media.videos?.[0];

  return (
    <div className="pb-16 space-y-8">
      
      {/* Backdrop Hero Banner (Matching reference design!) */}
      <div className="relative w-full h-72 sm:h-96 md:h-[450px] bg-black overflow-hidden">
        {media.backdropPath && (
          <img
            src={getBackdropUrl(media.backdropPath, 'original')}
            alt={displayTitle}
            className="w-full h-full object-cover object-top opacity-70"
          />
        )}
        {/* Editorial overlay framing */}
        <div className="absolute inset-0 bg-gradient-to-t from-kadr-bg via-kadr-bg/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

        {/* Back navigation button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            title="بازگشت"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-36 sm:-mt-48 relative z-20 space-y-8">
        
        {/* Header Block: Floating Poster + Titles */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          
          {/* Poster */}
          <div className="w-40 sm:w-56 aspect-[2/3] rounded-cinema overflow-hidden bg-kadr-surface border-2 border-kadr-surface shadow-cinema-elevated flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={getPosterUrl(media.posterPath, 'w500')}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
              }}
            />
          </div>

          {/* Titles & Meta */}
          <div className="flex-1 space-y-3 text-center sm:text-right">
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-kadr-primary text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {isMovie ? 'فیلم سینمایی' : 'مجموعه تلویزیونی'}
              </span>
              {media.releaseYear > 0 && (
                <span className="font-latin text-xs text-kadr-text-muted bg-kadr-surface px-2.5 py-0.5 rounded-full border border-kadr-border">
                  {media.releaseYear}
                </span>
              )}
              {media.tagline && (
                <span className="text-xs text-kadr-accent font-medium italic hidden md:inline-block">
                  «{media.tagline}»
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-kadr-text tracking-tight">
              {displayTitle}
            </h1>

            {media.originalTitle && (
              <p className="text-sm font-latin text-kadr-text-muted" dir="ltr">
                {media.originalTitle}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {media.genres.map(g => (
                <span key={g} className="px-3 py-1 rounded-cinema-pill bg-kadr-surface text-kadr-text text-xs border border-kadr-border font-medium">
                  {g}
                </span>
              ))}
            </div>

            {/* Play Trailer Button (Matching Reference Button in green) */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {trailerVideo ? (
                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-cinema-pill bg-kadr-primary hover:bg-kadr-primary-hover text-white text-sm font-bold shadow-cinema-card transition-transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>پخش تریلر رسمی</span>
                </button>
              ) : (
                <span className="text-xs text-kadr-text-muted bg-kadr-surface px-4 py-2 rounded-cinema-pill border border-kadr-border">
                  تریلر آنلاین برای این اثر موجود نیست
                </span>
              )}

              {/* Action Buttons: Watchlist / Favorite / Watched */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => (inWatchlist ? removeItem(numericId, mediaType) : addToWatchlist(media))}
                  className={`p-2.5 rounded-cinema-pill text-xs font-medium border transition-colors ${
                    inWatchlist
                      ? 'bg-kadr-primary text-white border-kadr-primary'
                      : 'bg-kadr-surface hover:bg-kadr-primary-light text-kadr-text border-kadr-border'
                  }`}
                  title={inWatchlist ? 'حذف از لیست تماشا' : 'افزودن به تماشای بعد'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  onClick={() => (isFavorite ? removeItem(numericId, mediaType) : addToFavorites(media))}
                  className={`p-2.5 rounded-cinema-pill text-xs font-medium border transition-colors ${
                    isFavorite
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-kadr-surface hover:bg-rose-50 text-kadr-text border-kadr-border'
                  }`}
                  title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={() => (isWatched ? removeItem(numericId, mediaType) : markAsWatched(media))}
                  className={`p-2.5 rounded-cinema-pill text-xs font-medium border transition-colors ${
                    isWatched
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-kadr-surface hover:bg-emerald-50 text-kadr-text border-kadr-border'
                  }`}
                  title={isWatched ? 'علامت به عنوان دیده‌نشده' : 'علامت به عنوان دیده‌شده'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* 3 Metric Cards (Matching reference screenshot: مدت زمان, امتیاز کاربران, امتیاز IMDb) */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Card 1: Runtime / Seasons */}
          <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
            <Clock className="w-4 h-4 text-kadr-text-muted mx-auto mb-1" />
            <div className="text-[11px] text-kadr-text-muted">
              {isMovie ? 'مدت زمان' : 'تعداد فصل‌ها'}
            </div>
            <div className="text-sm sm:text-base font-bold text-kadr-text font-latin mt-0.5">
              {isMovie
                ? `${media.runtime || 120} دقیقه`
                : `${media.numberOfSeasons || 1} فصل (${media.numberOfEpisodes || 10} قسمت)`}
            </div>
          </div>

          {/* Card 2: TMDB Users Rating */}
          <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto mb-1" />
            <div className="text-[11px] text-kadr-text-muted">امتیاز کاربران TMDB</div>
            <div className="text-sm sm:text-base font-bold text-kadr-text font-latin mt-0.5">
              {media.voteAverage.toFixed(1)} / 10
            </div>
          </div>

          {/* Card 3: IMDb Rating */}
          <div className="bg-kadr-surface rounded-cinema p-3 sm:p-4 border border-kadr-border text-center shadow-cinema-subtle">
            <div className="w-6 h-4 bg-[#F5C518] text-black font-black text-[9px] rounded flex items-center justify-center mx-auto mb-1">
              IMDb
            </div>
            <div className="text-[11px] text-kadr-text-muted">امتیاز رسمی IMDb</div>
            <div className="text-sm sm:text-base font-bold text-kadr-text font-latin mt-0.5">
              {media.imdbRating ? `${media.imdbRating} / 10` : `${media.voteAverage.toFixed(1)} / 10`}
            </div>
          </div>

        </div>

        {/* Dedicated Contextual Reason Card: «چرا بهت پیشنهاد شد؟» */}
        <div className="bg-kadr-accent-light/70 rounded-cinema p-5 border border-kadr-accent/30 shadow-cinema-subtle">
          <div className="flex items-center gap-2 text-sm font-bold text-kadr-accent mb-2">
            <Sparkles className="w-4 h-4 text-kadr-accent" />
            <span>چرا این اثر به شما پیشنهاد شد؟</span>
          </div>
          <p className="text-xs sm:text-sm text-kadr-text leading-relaxed">
            {media.matchReason ||
              `این اثر به دلیل کارگردانی فوق‌العاده ${media.director || 'سازندگان برجسته'}، استقبال تحسین‌برانگیز منتقدان بین‌المللی و تطابق عمیق اتمسفر داستانی در ژانرهای ${media.genres.join(' و ')}، به عنوان یک انتخاب ایده‌آل به شما پیشنهاد شد.`}
          </p>
        </div>

        {/* Tabbed Navigation Bar (معرفی, بازیگران, نظرات و یادداشت, مشابه‌ها) */}
        <div className="border-b border-kadr-border flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'overview'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            معرفی و داستان
          </button>

          <button
            onClick={() => setActiveTab('cast')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'cast'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            بازیگران ({media.cast.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'notes'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            یادداشت شخصی و امتیاز
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'similar'
                ? 'text-kadr-primary border-b-2 border-kadr-primary'
                : 'text-kadr-text-muted hover:text-kadr-text'
            }`}
          >
            عناوین مشابه
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border space-y-4">
              <h3 className="font-bold text-base text-kadr-text">خلاصه داستان</h3>
              <p className="text-sm text-kadr-text leading-relaxed">
                {media.overviewFa || media.overview || 'توضیحات فارسی برای این اثر هنوز ثبت نشده است.'}
              </p>
              {media.overviewFa && media.overview && (
                <div className="pt-4 border-t border-kadr-border/70">
                  <span className="text-xs text-kadr-text-muted font-bold block mb-1">متن انگلیسی:</span>
                  <p className="text-xs text-kadr-text-muted leading-relaxed font-latin" dir="ltr">
                    {media.overview}
                  </p>
                </div>
              )}
            </div>

            {/* Crew Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {media.director && (
                <div className="bg-kadr-surface rounded-cinema p-4 border border-kadr-border">
                  <span className="text-xs text-kadr-text-muted block">کارگردان</span>
                  <span className="font-bold text-sm text-kadr-text mt-1 block">{media.director}</span>
                </div>
              )}
              {media.creators && media.creators.length > 0 && (
                <div className="bg-kadr-surface rounded-cinema p-4 border border-kadr-border">
                  <span className="text-xs text-kadr-text-muted block">خالقان و نویسندگان</span>
                  <span className="font-bold text-sm text-kadr-text mt-1 block">{media.creators.join('، ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Cast */}
        {activeTab === 'cast' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.cast.map(actor => (
              <div key={actor.id} className="bg-kadr-surface rounded-cinema border border-kadr-border p-3 text-center space-y-2">
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-kadr-bg border border-kadr-border">
                  {actor.profilePath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profilePath}`}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/favicon.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-kadr-text-muted">
                      بدون عکس
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-kadr-text line-clamp-1">{actor.name}</h4>
                  <p className="text-[11px] text-kadr-text-muted line-clamp-1 mt-0.5">{actor.character}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Personal Notes & Rating */}
        {activeTab === 'notes' && (
          <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border space-y-6">
            
            {/* 10 Star Rating Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-kadr-text block">امتیاز شخصی شما به این اثر (از ۱۰):</label>
              <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`w-9 h-9 rounded-cinema font-latin font-bold text-xs flex items-center justify-center border transition-all ${
                      selectedRating >= star
                        ? 'bg-amber-400 text-black border-amber-500 scale-105'
                        : 'bg-kadr-bg text-kadr-text-muted border-kadr-border hover:border-amber-400'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Note text area */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-kadr-text block">یادداشت خصوصی شما درباره فیلم:</label>
              <textarea
                value={userNoteText}
                onChange={(e) => setUserNoteText(e.target.value)}
                placeholder="احساسات، نظریه‌ها، دیالوگ ماندگار یا هر چیزی که دوست دارید بعداً یادتان بماند..."
                rows={4}
                className="w-full bg-kadr-bg rounded-cinema border border-kadr-border p-3 text-xs sm:text-sm text-kadr-text outline-none focus:border-kadr-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-6 py-2 rounded-cinema-pill bg-kadr-primary hover:bg-kadr-primary-hover text-white text-xs font-bold transition-colors"
              >
                ذخیره یادداشت و امتیاز
              </button>

              {noteSaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>یادداشت روی حافظه دستگاه ذخیره شد!</span>
                </span>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Similar */}
        {activeTab === 'similar' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.similar && media.similar.length > 0 ? (
              media.similar.map(item => (
                <MediaCard key={item.id} media={item} />
              ))
            ) : (
              <p className="text-xs text-kadr-text-muted col-span-4 text-center py-8">
                عنوان مشابهی یافت نشد.
              </p>
            )}
          </div>
        )}

      </div>

      {/* Trailer Modal */}
      {showTrailerModal && trailerVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-cinema overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white">
              <span className="text-xs font-bold">{trailerVideo.name}</span>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1`}
                title={trailerVideo.name}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
