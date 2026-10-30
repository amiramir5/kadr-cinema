import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Sparkles, Clock, Film, Tv, ArrowLeft, Heart } from 'lucide-react';
import { ScoredRecommendation } from '../types';
import { getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';

interface RecommendationCardProps {
  item: ScoredRecommendation;
  rank: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, rank }) => {
  const { media, matchScore, matchReasonFa, matchedAttributes } = item;
  const { addToWatchlist, addToFavorites, removeItem, isSavedAs } = useUser();

  const inWatchlist = isSavedAs(media.id, media.mediaType, 'watchlist');
  const isFavorite = isSavedAs(media.id, media.mediaType, 'favorite');

  const poster = getPosterUrl(media.posterPath, 'w500');
  const displayTitle = media.titleFa || media.title;
  const isMovie = media.mediaType === 'movie';

  return (
    <div className="bg-kadr-surface rounded-cinema border border-kadr-border hover:border-kadr-border-hover p-4 sm:p-5 shadow-cinema-subtle hover:shadow-cinema-card transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-5">
        
        {/* Poster & Badges Column */}
        <div className="relative w-full md:w-48 aspect-[2/3] flex-shrink-0 rounded-cinema overflow-hidden bg-kadr-bg border border-kadr-border">
          <img
            src={poster}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
            }}
          />

          {/* Rank Badge */}
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-kadr-primary text-white text-xs font-latin font-bold flex items-center justify-center shadow">
            #{rank}
          </div>

          {/* Match Score Badge */}
          <div className="absolute top-2.5 left-2.5 bg-kadr-accent text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm font-latin">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{matchScore}%</span>
          </div>

          {/* Media Type */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
            {isMovie ? <Film className="w-3 h-3 text-kadr-primary-light" /> : <Tv className="w-3 h-3 text-kadr-accent-light" />}
            <span>{isMovie ? 'فیلم سینمایی' : 'مجموعه تلویزیونی'}</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Titles & Ratings */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <Link to={`/title/${media.mediaType}/${media.id}`} className="group">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-kadr-text group-hover:text-kadr-primary transition-colors">
                    {displayTitle}
                  </h3>
                  {media.originalTitle && media.originalTitle !== displayTitle && (
                    <p className="text-sm font-latin text-kadr-text-muted mt-0.5" dir="ltr">
                      {media.originalTitle} {media.releaseYear > 0 && `(${media.releaseYear})`}
                    </p>
                  )}
                </Link>
              </div>

              {/* Rating Pills */}
              <div className="flex items-center gap-2">
                {media.voteAverage > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-latin">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{media.voteAverage.toFixed(1)}</span>
                    <span className="text-[10px] text-amber-600 font-normal">/10</span>
                  </div>
                )}
                {media.imdbRating && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#503E00] text-xs font-bold font-latin">
                    <span className="bg-[#F5C518] text-black text-[9px] px-1 py-0.5 rounded font-black">IMDb</span>
                    <span>{media.imdbRating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Tags: Year, Runtime, Genres */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-kadr-text-muted mb-3.5">
              {media.releaseYear > 0 && (
                <span className="font-latin px-2 py-0.5 rounded-full bg-kadr-bg border border-kadr-border">
                  {media.releaseYear}
                </span>
              )}
              {media.runtime ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-kadr-bg border border-kadr-border">
                  <Clock className="w-3 h-3" />
                  <span>{media.runtime} دقیقه</span>
                </span>
              ) : media.numberOfSeasons ? (
                <span className="px-2 py-0.5 rounded-full bg-kadr-bg border border-kadr-border">
                  {media.numberOfSeasons} فصل
                </span>
              ) : null}

              {media.director && (
                <span className="px-2 py-0.5 rounded-full bg-kadr-bg border border-kadr-border">
                  کارگردان: <span className="font-medium text-kadr-text">{media.director}</span>
                </span>
              )}

              {media.genres.map(genre => (
                <span key={genre} className="px-2 py-0.5 rounded-full bg-kadr-primary-light text-kadr-primary font-medium text-[11px]">
                  {genre}
                </span>
              ))}
            </div>

            {/* Contextual Persian Reason Box */}
            <div className="p-3.5 rounded-cinema bg-kadr-accent-light/60 border border-kadr-accent/30 text-kadr-text mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-kadr-accent mb-1">
                <Sparkles className="w-3.5 h-3.5 text-kadr-accent" />
                <span>چرا بهت پیشنهاد شد؟</span>
              </div>
              <p className="text-xs sm:text-sm text-kadr-text leading-relaxed">
                {matchReasonFa}
              </p>
            </div>

            {/* Overview / Excerpt */}
            <p className="text-xs sm:text-sm text-kadr-text-muted leading-relaxed line-clamp-2 mb-4">
              {media.overviewFa || media.overview || 'خلاصه داستانی برای این اثر ثبت نشده است.'}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-kadr-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => (inWatchlist ? removeItem(media.id, media.mediaType) : addToWatchlist(media))}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-cinema-pill text-xs font-medium transition-all ${
                  inWatchlist
                    ? 'bg-kadr-primary text-white'
                    : 'bg-kadr-bg hover:bg-kadr-primary-light text-kadr-text border border-kadr-border'
                }`}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{inWatchlist ? 'در لیست تماشا' : 'تماشای بعد'}</span>
              </button>

              <button
                onClick={() => (isFavorite ? removeItem(media.id, media.mediaType) : addToFavorites(media))}
                className={`p-2 rounded-cinema-pill text-xs transition-colors border ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-kadr-bg hover:bg-rose-50 text-kadr-text-muted hover:text-rose-600 border-kadr-border'
                }`}
                title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            <Link
              to={`/title/${media.mediaType}/${media.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-kadr-primary hover:text-kadr-primary-hover transition-colors"
            >
              <span>مشاهده کامل و تریلر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
