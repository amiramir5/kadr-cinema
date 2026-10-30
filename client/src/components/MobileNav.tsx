import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, User, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const MobileNav: React.FC = () => {
  const { savedItems } = useUser();
  const watchlistCount = savedItems.filter(i => i.listType === 'watchlist').length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-kadr-surface/95 backdrop-blur-lg border-t border-kadr-border py-2 px-4 shadow-cinema-card">
      <nav className="flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-kadr-primary font-bold' : 'text-kadr-text-muted hover:text-kadr-text'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px]">خانه</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-kadr-primary font-bold' : 'text-kadr-text-muted hover:text-kadr-text'
            }`
          }
        >
          <Sparkles className="w-5 h-5 text-kadr-accent" />
          <span className="text-[11px]">کشف هوشمند</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-kadr-primary font-bold' : 'text-kadr-text-muted hover:text-kadr-text'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px]">کاوش</span>
        </NavLink>

        <NavLink
          to="/my-list"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors relative ${
              isActive ? 'text-kadr-primary font-bold' : 'text-kadr-text-muted hover:text-kadr-text'
            }`
          }
        >
          <div className="relative">
            <Bookmark className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-kadr-accent text-white text-[9px] flex items-center justify-center font-latin font-bold">
                {watchlistCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">لیست من</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-kadr-primary font-bold' : 'text-kadr-text-muted hover:text-kadr-text'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">پروفایل</span>
        </NavLink>
      </nav>
    </div>
  );
};
