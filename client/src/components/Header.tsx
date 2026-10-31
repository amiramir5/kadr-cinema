import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-6 sm:px-10 border-b border-kadr-border/60">
      
      {/* Mobile Brand (visible only on mobile) */}
      <div className="flex md:hidden items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-kadr-primary text-white flex items-center justify-center font-bold text-sm">
          K
        </div>
        <span className="font-black text-lg text-kadr-text">کادر</span>
      </div>

      <div className="hidden md:block">
        <span className="text-xs text-kadr-text-muted font-medium">امروز چی می‌خوای تماشا کنی؟</span>
      </div>

      {/* User profile & Search shortcut */}
      <div className="flex items-center gap-4">
        <NavLink
          to="/explore"
          className="w-10 h-10 rounded-full bg-white border border-kadr-border flex items-center justify-center text-kadr-text-muted hover:text-kadr-primary hover:border-kadr-primary/30 shadow-sm transition-colors"
          title="جستجو"
        >
          <Search className="w-4 h-4" />
        </NavLink>
      </div>

    </header>
  );
};
