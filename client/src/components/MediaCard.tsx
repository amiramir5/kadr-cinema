import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Heart, Film, Tv } from 'lucide-react';
import { MediaItem } from '../types';
import { getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';

interface MediaCardProps {
  media: MediaItem;
  variant?: 'standard' | 'compact' | 'featured';
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, variant = 'standard' }) => {
  const { addToWatchlist, removeItem, isSavedAs } = useUser();
  const inWatchlist = isSavedAs(media.id, media.mediaType, 'watchlist');
  const isWatched = isSavedAs(media.id, media.mediaType, 'watched');

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
    <div className="group relative flex flex-col bg-kadr-surface rounded-cinema border border-kadr-border hover:border-kadr-border-hover overflow-hidden transition-all duration-300 hover:shadow-cinema-card">
      
      {/* Poster Container */}
      <Link to={`/title/${media.mediaType}/${media.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-kadr-bg block">
        <img
          src={poster}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-poster.svg';
          }}
        />

        {/* Rating Pill */}
        {media.voteAverage > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-amber-300 text-xs font-latin font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{media.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Media Type Badge */}
        <div className="absolute top-2.5 left-2.5 bg-kadr-surface/90 backdrop-blur-sm text-kadr-text text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-kadr-border">
          {isMovie ? <Film className="w-3 h-3 text-kadr-primary" /> : <Tv className="w-3 h-3 text-kadr-accent" />}
          <span>{isMovie ? 'فیلم' : 'سریال'}</span>
        </div>

        {/* Quick Save Action Pill */}
        <button
          onClick={handleToggleWatchlist}
          title={inWatchlist ? 'حذف از تماشای بعد' : 'افزودن به تماشای بعد'}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
            inWatchlist
              ? 'bg-kadr-primary text-white scale-105'
              : 'bg-black/60 text-white/90 hover:bg-kadr-primary hover:text-white'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </Link>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link to={`/title/${media.mediaType}/${media.id}`} className="block">
            <h3 className="font-bold text-sm text-kadr-text group-hover:text-kadr-primary transition-colors line-clamp-1">
              {displayTitle}
            </h3>
            {media.originalTitle && media.originalTitle !== displayTitle && (
              <p className="text-[11px] text-kadr-text-muted font-latin line-clamp-1 mt-0.5" dir="ltr">
                {media.originalTitle}
              </p>
            )}
          </Link>
        </div>

        {/* Metadata & Genres */}
        <div className="flex items-center justify-between text-xs text-kadr-text-muted border-t border-kadr-border/70 pt-2.5 mt-auto">
          <div className="flex items-center gap-2">
            {media.releaseYear > 0 && <span className="font-latin text-[12px]">{media.releaseYear}</span>}
            {media.runtime ? (
              <>
                <span>•</span>
                <span>{media.runtime} د</span>
              </>
            ) : media.numberOfSeasons ? (
              <>
                <span>•</span>
                <span>{media.numberOfSeasons} فصل</span>
              </>
            ) : null}
          </div>

          {media.genres.length > 0 && (
            <span className="text-[11px] text-kadr-primary bg-kadr-primary-light px-2 py-0.5 rounded-full font-medium">
              {media.genres[0]}
            </span>
          )}
        </div>

      </div>

    </div>
  );
};
