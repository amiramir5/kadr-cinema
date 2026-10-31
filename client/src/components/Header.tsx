import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Bookmark, Settings, Search, Film } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { KadrApi } from '../services/api';

export const Header: React.FC = () => {
  const { savedItems } = useUser();
  const [tmdbLive, setTmdbLive] = useState<boolean | null>(null);

  useEffect(() => {
    KadrApi.getStatus()
      .then(res => setTmdbLive(res.config.tmdbLive))
      .catch(() => setTmdbLive(false));
  }, []);

  const watchlistCount = savedItems.filter(i => i.listType === 'watchlist').length;

  return (
    <header className="sticky top-0 z-40 bg-kadr-bg/95 backdrop-blur-md border-b border-kadr-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-cinema bg-kadr-primary text-kadr-bg flex items-center justify-center shadow-cinema-subtle group-hover:bg-kadr-primary-hover transition-colors">
            <Film className="w-6 h-6 text-kadr-bg" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-kadr-text font-vazir">کادر</span>
              <span className="text-xs uppercase tracking-widest font-latin font-bold text-kadr-accent px-1.5 py-0.5 rounded bg-kadr-accent-light border border-kadr-accent/20">KADR</span>
            </div>
            <span className="text-xs text-kadr-text-muted hidden sm:inline-block">امشب، چی بهت میچسبه؟</span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-kadr-surface/80 p-1.5 rounded-cinema-pill border border-kadr-border shadow-cinema-subtle">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-cinema-pill text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kadr-primary text-white shadow-sm'
                  : 'text-kadr-text hover:text-kadr-primary hover:bg-kadr-primary-light/50'
              }`
            }
          >
            <span>خانه</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-cinema-pill text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kadr-primary text-white shadow-sm'
                  : 'text-kadr-text hover:text-kadr-primary hover:bg-kadr-primary-light/50'
              }`
            }
          >
            <Sparkles className="w-4 h-4 text-kadr-accent" />
            <span>کشف هوشمند</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-cinema-pill text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kadr-primary text-white shadow-sm'
                  : 'text-kadr-text hover:text-kadr-primary hover:bg-kadr-primary-light/50'
              }`
            }
          >
            <Compass className="w-4 h-4" />
            <span>جستجو و کاوش</span>
          </NavLink>

          <NavLink
            to="/my-list"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-cinema-pill text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kadr-primary text-white shadow-sm'
                  : 'text-kadr-text hover:text-kadr-primary hover:bg-kadr-primary-light/50'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>لیست من</span>
            {watchlistCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-kadr-accent text-white text-xs flex items-center justify-center font-latin font-bold">
                {watchlistCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-cinema-pill text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kadr-primary text-white shadow-sm'
                  : 'text-kadr-text hover:text-kadr-primary hover:bg-kadr-primary-light/50'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>تنظیمات</span>
          </NavLink>
        </nav>

        {/* Right Action & API Status Badge */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/explore"
            className="w-10 h-10 rounded-full border border-kadr-border bg-kadr-surface flex items-center justify-center text-kadr-text-muted hover:text-kadr-primary hover:border-kadr-primary/30 transition-colors shadow-cinema-subtle"
            title="جستجوی سریع"
          >
            <Search className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/settings"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-cinema-pill border border-kadr-border bg-kadr-surface text-xs text-kadr-text-muted hover:border-kadr-primary/40 transition-colors"
            title="وضعیت اتصال TVmaze و هوش مصنوعی"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="font-latin text-[11px] font-medium">
              TVmaze • Gemini 3.8
            </span>
          </NavLink>
        </div>

      </div>
    </header>
  );
};
