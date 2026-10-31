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

      {/* User profile & Search shortcut matching reference */}
      <div className="flex items-center gap-4">
        <NavLink
          to="/explore"
          className="w-10 h-10 rounded-full bg-white border border-kadr-border flex items-center justify-center text-kadr-text-muted hover:text-kadr-primary hover:border-kadr-primary/30 shadow-sm transition-colors"
          title="جستجو"
        >
          <Search className="w-4 h-4" />
        </NavLink>

        {/* User Avatar matching top right of reference */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-10 h-10 rounded-full border-2 border-kadr-border overflow-hidden bg-kadr-card shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="پروفایل کاربر"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

    </header>
  );
};
