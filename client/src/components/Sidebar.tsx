import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Bookmark, Settings, Info, Film, Send } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Sidebar: React.FC = () => {
  const { savedItems } = useUser();
  const watchlistCount = savedItems.filter(i => i.listType === 'watchlist').length;

  const NAV_ITEMS = [
    { to: '/', label: 'خانه', icon: Home, end: true },
    { to: '/discover', label: 'تاریخچه', icon: History },
    { to: '/my-list', label: 'علاقه‌مندی‌ها', icon: Bookmark, badge: watchlistCount },
    { to: '/settings', label: 'تنظیمات', icon: Settings },
    { to: '/explore', label: 'درباره کادر', icon: Info },
  ];

  return (
    <aside className="w-64 bg-white border-l border-kadr-border flex-shrink-0 flex flex-col justify-between p-6 min-h-screen sticky top-0 hidden md:flex z-30">
      
      {/* Brand Logo matching reference */}
      <div>
        <NavLink to="/" className="flex flex-col items-center text-center group mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A93226] to-[#78281F] flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
            {/* Clapperboard Icon SVG matching reference */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-white">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-kadr-text tracking-widest font-vazir">KADR</h2>
          <span className="text-[11px] text-kadr-text-muted font-medium">دستیار هوشمند سینما</span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-kadr-primary-light text-kadr-primary border border-kadr-primary/20 shadow-sm'
                      : 'text-kadr-text hover:bg-[#F9F7F2] hover:text-kadr-primary'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-kadr-primary text-white text-[11px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Box matching reference */}
      <div className="bg-[#F8F6F0] border border-kadr-border rounded-2xl p-4 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-kadr-border mx-auto flex items-center justify-center shadow-sm">
          <Film className="w-5 h-5 text-kadr-primary" />
        </div>
        <p className="text-xs font-bold text-kadr-text leading-relaxed">
          همیشه یک فیلم خوب در کنارت هست!
        </p>
        <div className="flex items-center justify-center gap-3 pt-1 text-kadr-text-muted text-xs">
          <a href="#" className="hover:text-kadr-primary transition-colors">تلگرام</a>
          <span>•</span>
          <a href="#" className="hover:text-kadr-primary transition-colors">دیسکورد</a>
        </div>
      </div>

    </aside>
  );
};
