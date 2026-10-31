import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Film, Tv } from 'lucide-react';
import { MediaItem } from '../types';
import { getPosterUrl } from '../services/api';
import { useUser } from '../context/UserContext';

interface MediaCardProps {
  media: MediaItem;
  variant?: 'standard' | 'compact' | 'featured';
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
    <div className="group relative flex flex-col bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[#7c6af7]/60 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(124,106,247,0.25)]">
      
      {/* Poster Container */}
      <Link to={`/title/${media.mediaType}/${media.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-[#12122a] block">
        <img
          src={poster}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = './placeholder-poster.svg';
          }}
        />

        {/* Cinematic gradient overlay at bottom of poster */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/50 to-transparent pointer-events-none" />

        {/* Rating Pill (top-right) */}
        {media.voteAverage > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-[#f5c842] text-xs font-latin font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-[#f5c842]/20">
            <Star className="w-3.5 h-3.5 fill-[#f5c842] text-[#f5c842]" />
            <span>{media.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Media Type Badge (top-left) */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white/10">
          {isMovie ? <Film className="w-3 h-3 text-[#7c6af7]" /> : <Tv className="w-3 h-3 text-[#f97b6b]" />}
          <span>{isMovie ? 'فیلم' : 'سریال'}</span>
        </div>

        {/* Quick Save Action Pill */}
        <button
          onClick={handleToggleWatchlist}
          title={inWatchlist ? 'حذف از لیست' : 'افزودن به لیست'}
          className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
            inWatchlist
              ? 'bg-[#7c6af7] text-white scale-105 shadow-glow-primary'
              : 'bg-black/70 text-white/80 hover:bg-[#7c6af7] hover:text-white border border-white/10'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </Link>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2 bg-[#0d0d1a]/60">
        <div>
          <Link to={`/title/${media.mediaType}/${media.id}`} className="block">
            <h3 className="font-bold text-sm text-white group-hover:text-[#7c6af7] transition-colors line-clamp-1">
              {displayTitle}
            </h3>
            {media.originalTitle && media.originalTitle !== displayTitle && (
              <p className="text-[11px] text-white/40 font-latin line-clamp-1 mt-0.5" dir="ltr">
                {media.originalTitle}
              </p>
            )}
          </Link>
        </div>

        {/* Metadata & Genres */}
        <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-2.5 mt-auto">
          <div className="flex items-center gap-2">
            {media.releaseYear > 0 && <span className="font-latin text-[12px]">{media.releaseYear}</span>}
            {media.runtime ? (
              <>
                <span className="text-white/20">•</span>
                <span>{media.runtime} د</span>
              </>
            ) : media.numberOfSeasons ? (
              <>
                <span className="text-white/20">•</span>
                <span>{media.numberOfSeasons} فصل</span>
              </>
            ) : null}
          </div>

          {media.genres.length > 0 && (
            <span className="text-[11px] text-[#7c6af7] bg-[#7c6af7]/15 border border-[#7c6af7]/25 px-2 py-0.5 rounded-full font-medium">
              {media.genres[0]}
            </span>
          )}
        </div>

      </div>

    </div>
  );
};
