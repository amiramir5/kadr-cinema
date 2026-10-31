import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Film, Tv } from 'lucide-react';
import { MediaItem } from '../types';
import { getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';

interface MediaCardProps {
  media: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
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
    <div className="warm-card overflow-hidden group flex flex-col justify-between">
      
      {/* Poster Container */}
      <Link to={`/title/${media.mediaType}/${media.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-kadr-card block">
        <img
          src={poster}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = './placeholder-poster.svg';
          }}
        />

        {/* Rating Badge */}
        {media.voteAverage > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-amber-400 text-xs font-latin font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{media.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Media Type */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-kadr-text text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {isMovie ? 'فیلم' : 'سریال'}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleToggleWatchlist}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full shadow-md transition-all ${
            inWatchlist
              ? 'bg-kadr-primary text-white scale-105'
              : 'bg-white/90 text-kadr-text hover:bg-kadr-primary hover:text-white'
          }`}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </Link>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <Link to={`/title/${media.mediaType}/${media.id}`} className="block">
          <h3 className="font-bold text-xs sm:text-sm text-kadr-text group-hover:text-kadr-primary transition-colors line-clamp-1">
            {displayTitle}
          </h3>
          {media.originalTitle && (
            <p className="text-[11px] text-kadr-text-muted font-latin line-clamp-1 mt-0.5" dir="ltr">
              {media.originalTitle}
            </p>
          )}
        </Link>

        <div className="pt-2 border-t border-kadr-border/70 flex items-center justify-between text-[11px] text-kadr-text-muted mt-auto">
          <span>{media.releaseYear > 0 ? media.releaseYear : ''}</span>
          {media.genres.length > 0 && (
            <span className="text-kadr-primary font-medium">{media.genres[0]}</span>
          )}
        </div>
      </div>

    </div>
  );
};
