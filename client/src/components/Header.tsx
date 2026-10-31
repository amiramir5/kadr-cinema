import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Compass, Bookmark, Search, Film, Menu, X, Cpu } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Header: React.FC = () => {
  const { savedItems } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const watchlistCount = savedItems.filter(i => i.listType === 'watchlist').length;

  return (
    <header className="sticky top-0 z-40 bg-[#0d0d1a]/80 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7c6af7] to-[#f97b6b] p-[1px] shadow-glow-primary transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#12122a] rounded-2xl flex items-center justify-center">
              <Film className="w-5 h-5 text-[#7c6af7]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white font-vazir drop-shadow-[0_0_20px_rgba(124,106,247,0.5)]">
                کادر
              </span>
              <span className="text-[10px] uppercase tracking-widest font-latin font-bold text-[#f97b6b] px-2 py-0.5 rounded-full bg-[#f97b6b]/10 border border-[#f97b6b]/30">
                KADR
              </span>
            </div>
            <span className="text-xs text-white/40 hidden sm:inline-block">دستیار سینمایی هوشمند</span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-glass">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6af7] text-white shadow-glow-primary'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <span>خانه</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6af7] text-white shadow-glow-primary'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Sparkles className="w-4 h-4 text-[#f97b6b]" />
            <span>کشف هوشمند</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6af7] text-white shadow-glow-primary'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Compass className="w-4 h-4" />
            <span>کاوش</span>
          </NavLink>

          <NavLink
            to="/my-list"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#7c6af7] text-white shadow-glow-primary'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>لیست من</span>
            {watchlistCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#f97b6b] text-white text-xs flex items-center justify-center font-latin font-bold">
                {watchlistCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Right Status Badge & Search */}
        <div className="flex items-center gap-3">
          {/* Engine / Service Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-latin font-semibold text-[11px] tracking-wide">
              Gemini ✦ TVmaze
            </span>
          </div>

          <NavLink
            to="/explore"
            className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.05] flex items-center justify-center text-white/70 hover:text-white hover:border-[#7c6af7]/50 hover:bg-[#7c6af7]/10 transition-all"
            title="جستجو"
          >
            <Search className="w-4 h-4" />
          </NavLink>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/[0.05] flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0d0d1a]/95 backdrop-blur-2xl p-4 flex flex-col gap-2">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-[#7c6af7] text-white' : 'text-white/70 hover:bg-white/5'
              }`
            }
          >
            خانه
          </NavLink>
          <NavLink
            to="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-[#7c6af7] text-white' : 'text-white/70 hover:bg-white/5'
              }`
            }
          >
            <span>کشف هوشمند</span>
            <Sparkles className="w-4 h-4 text-[#f97b6b]" />
          </NavLink>
          <NavLink
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-[#7c6af7] text-white' : 'text-white/70 hover:bg-white/5'
              }`
            }
          >
            کاوش
          </NavLink>
          <NavLink
            to="/my-list"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-[#7c6af7] text-white' : 'text-white/70 hover:bg-white/5'
              }`
            }
          >
            <span>لیست من</span>
            {watchlistCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#f97b6b] text-white text-xs flex items-center justify-center font-bold">
                {watchlistCount}
              </span>
            )}
          </NavLink>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400 px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-latin">Gemini ✦ TVmaze فعال</span>
          </div>
        </div>
      )}
    </header>
  );
};
