import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Play } from 'lucide-react';
import { ScoredRecommendation } from '../types';
import { getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';

export interface RecommendationCardProps {
  item: ScoredRecommendation;
  rank: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, rank }) => {
  const { media, matchScore, matchReasonFa } = item;
  const { addToWatchlist, removeItem, isSavedAs } = useUser();
  const inWatchlist = isSavedAs(media.id, media.mediaType, 'watchlist');

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeItem(media.id, media.mediaType);
    } else {
      addToWatchlist(media);
    }
  };

  const poster = getPosterUrl(media.posterPath, 'w500');
  const displayTitle = media.titleFa || media.title;
  const isMovie = media.mediaType === 'movie';

  return (
    <div className="warm-card p-5 sm:p-6 transition-all duration-300 hover:border-kadr-border-hover relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
        
        {/* Poster with Rank Badge */}
        <div className="relative w-full sm:w-44 aspect-[2/3] sm:h-64 flex-shrink-0 rounded-2xl overflow-hidden bg-kadr-card shadow-sm">
          <Link to={`/title/${media.mediaType}/${media.id}`} className="block w-full h-full">
            <img
              src={poster}
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './placeholder-poster.svg';
              }}
            />
          </Link>

          {/* Rank Badge */}
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-kadr-primary text-white text-xs font-bold font-latin flex items-center justify-center shadow-md">
            #{rank}
          </div>

          {/* Media Type */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {isMovie ? 'سینمایی' : 'سریال'}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          
          <div>
            {/* Top Bar: Title & Scores */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/title/${media.mediaType}/${media.id}`}>
                  <h3 className="text-lg sm:text-xl font-black text-kadr-text hover:text-kadr-primary transition-colors font-vazir">
                    {displayTitle}
                  </h3>
                </Link>
                {media.originalTitle && (
                  <p className="text-xs text-kadr-text-muted font-latin mt-0.5" dir="ltr">
                    {media.originalTitle} ({media.releaseYear})
                  </p>
                )}
              </div>

              {/* Match Score & Rating */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2.5 py-1 rounded-full bg-kadr-primary-light text-kadr-primary text-xs font-black border border-kadr-primary/20">
                  {matchScore}٪ تطابق
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-amber-700 text-xs font-bold font-latin">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{media.voteAverage.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* AI Recommendation Reason Banner */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-[#F8F6F0] border border-kadr-border/80">
              <span className="text-[11px] font-bold text-kadr-primary block mb-1">
                ✦ دلیل انتخاب هوش مصنوعی:
              </span>
              <p className="text-xs text-kadr-text leading-relaxed font-medium">
                {matchReasonFa}
              </p>
            </div>

            {/* Overview */}
            <p className="text-xs text-kadr-text-muted line-clamp-2 mt-3 leading-relaxed">
              {media.overviewFa || media.overview}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-kadr-border/60 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {media.genres.slice(0, 3).map((g, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-white border border-kadr-border text-[11px] font-medium text-kadr-text-muted">
                  {g}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  inWatchlist
                    ? 'bg-kadr-primary text-white border-kadr-primary'
                    : 'bg-white text-kadr-text border-kadr-border hover:border-kadr-primary'
                }`}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{inWatchlist ? 'در لیست شما' : 'افزودن به لیست'}</span>
              </button>

              <Link
                to={`/title/${media.mediaType}/${media.id}`}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-kadr-primary hover:bg-kadr-primary-hover text-white text-xs font-bold transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>جزئیات و تریلر</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
