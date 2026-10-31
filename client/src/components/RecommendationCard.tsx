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
  const { media, matchScore, matchReasonFa } = item;
  const { addToWatchlist, addToFavorites, removeItem, isSavedAs } = useUser();

  const inWatchlist = isSavedAs(media.id, media.mediaType, 'watchlist');
  const isFavorite = isSavedAs(media.id, media.mediaType, 'favorite');

  const poster = getPosterUrl(media.posterPath, 'w500');
  const displayTitle = media.titleFa || media.title;
  const isMovie = media.mediaType === 'movie';

  // SVG circular progress calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  return (
    <div className="bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[#7c6af7]/50 p-4 sm:p-6 shadow-glass hover:shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(124,106,247,0.2)] transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Poster Column */}
        <div className="relative w-full md:w-52 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden bg-[#12122a] border border-white/10">
          <img
            src={poster}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = './placeholder-poster.svg';
            }}
          />

          {/* Rank Badge */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#7c6af7] text-white text-xs font-latin font-black flex items-center justify-center shadow-lg shadow-[#7c6af7]/40 border border-white/20">
            #{rank}
          </div>

          {/* Media Type Badge */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white/90 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
            {isMovie ? <Film className="w-3 h-3 text-[#7c6af7]" /> : <Tv className="w-3 h-3 text-[#f97b6b]" />}
            <span>{isMovie ? 'سینمایی' : 'سریال'}</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Title, Circular Match Ring, Ratings */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <Link to={`/title/${media.mediaType}/${media.id}`} className="group">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-white group-hover:text-[#7c6af7] transition-colors">
                    {displayTitle}
                  </h3>
                  {media.originalTitle && media.originalTitle !== displayTitle && (
                    <p className="text-xs sm:text-sm font-latin text-white/40 mt-0.5" dir="ltr">
                      {media.originalTitle} {media.releaseYear > 0 && `(${media.releaseYear})`}
                    </p>
                  )}
                </Link>
              </div>

              {/* Match Score Circular Progress Ring & Rating */}
              <div className="flex items-center gap-3">
                {/* Circular score ring */}
                <div className="relative flex items-center justify-center" title={`درصد همخوانی: ${matchScore}%`}>
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 54 54">
                    <circle
                      cx="27"
                      cy="27"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="27"
                      cy="27"
                      r={radius}
                      stroke="url(#purpleGrad)"
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <defs>
                      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c6af7" />
                        <stop offset="100%" stopColor="#f97b6b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[12px] font-latin font-black text-white">{matchScore}%</span>
                    <span className="text-[8px] text-white/50">تطابق</span>
                  </div>
                </div>

                {/* Rating Badge */}
                {media.voteAverage > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#f5c842]/30 text-[#f5c842] text-xs font-bold font-latin">
                    <Star className="w-3.5 h-3.5 fill-[#f5c842] text-[#f5c842]" />
                    <span>{media.voteAverage.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Tags: Year, Runtime, Genres */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-4">
              {media.releaseYear > 0 && (
                <span className="font-latin px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                  {media.releaseYear}
                </span>
              )}
              {media.runtime ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                  <Clock className="w-3 h-3 text-[#7c6af7]" />
                  <span>{media.runtime} دقیقه</span>
                </span>
              ) : media.numberOfSeasons ? (
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                  {media.numberOfSeasons} فصل
                </span>
              ) : null}

              {media.director && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80">
                  کارگردان: <span className="text-white font-medium">{media.director}</span>
                </span>
              )}

              {media.genres.map(genre => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 rounded-full bg-[#7c6af7]/15 border border-[#7c6af7]/30 text-[#7c6af7] font-medium text-[11px]"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Contextual Persian Reason Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#7c6af7]/15 to-[#f97b6b]/10 border border-[#7c6af7]/30 text-white mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f97b6b] mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f97b6b]" />
                <span>دلیل انتخاب هوش مصنوعی:</span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
                {matchReasonFa}
              </p>
            </div>

            {/* Overview */}
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-2 mb-4">
              {media.overviewFa || media.overview || 'خلاصه داستانی برای این اثر ثبت نشده است.'}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => (inWatchlist ? removeItem(media.id, media.mediaType) : addToWatchlist(media))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  inWatchlist
                    ? 'bg-[#7c6af7] text-white shadow-glow-primary'
                    : 'bg-white/[0.05] hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{inWatchlist ? 'در لیست تماشا' : 'افزودن به لیست'}</span>
              </button>

              <button
                onClick={() => (isFavorite ? removeItem(media.id, media.mediaType) : addToFavorites(media))}
                className={`p-2 rounded-full text-xs transition-colors border ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/[0.05] hover:bg-rose-500/10 text-white/60 hover:text-rose-400 border-white/10'
                }`}
                title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
              </button>
            </div>

            <Link
              to={`/title/${media.mediaType}/${media.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-[#7c6af7] hover:text-[#6a58e5] transition-colors"
            >
              <span>جزئیات و تریلر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
