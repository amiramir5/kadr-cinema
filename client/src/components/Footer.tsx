import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-kadr-surface border-t border-kadr-border mt-20 pt-12 pb-24 md:pb-12 text-kadr-text-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-kadr-border">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-kadr-primary text-white flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl text-kadr-text">کادر (KADR)</span>
            </div>
            <p className="text-kadr-text-muted text-xs leading-relaxed max-w-md">
              پلتفرم هوشمند کشف فیلم و سریال بر پایه درک زبان طبیعی، تحلیل معنایی و پیشنهادهای اختصاصی سینمایی.
              امشب، اثری را تماشا کنید که دقیقاً با حال‌وهوای روحی و سلیقه شما همخوانی دارد.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-kadr-text text-sm mb-3">بخش‌های اصلی</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-kadr-primary transition-colors">صفحه اصلی</Link></li>
              <li><Link to="/discover" className="hover:text-kadr-primary transition-colors">کشف هوشمند فیلم و سریال</Link></li>
              <li><Link to="/explore" className="hover:text-kadr-primary transition-colors">جستجو و کاوش ژانرها</Link></li>
              <li><Link to="/my-list" className="hover:text-kadr-primary transition-colors">لیست تماشا و علاقه‌مندی‌ها</Link></li>
              <li><Link to="/settings" className="hover:text-kadr-primary transition-colors">تنظیمات و پشتیبان‌گیری</Link></li>
            </ul>
          </div>

          {/* TMDB Attribution Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-kadr-text text-sm mb-1">تأمین‌کننده داده‌های سینمایی</h4>
            <div className="flex items-center gap-3">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                alt="TMDB Logo"
                className="w-14 h-auto"
              />
              <p className="text-[11px] leading-tight text-kadr-text-muted">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
            <a
              href="https://developer.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] text-kadr-primary hover:underline"
            >
              مستندات و کلید دسترسی رسمی TMDB &rarr;
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-kadr-text-muted">
          <p>© {new Date().getFullYear()} پلتفرم مستقل کادر (KADR). طراحی شده با رویکرد مینیمالیسم سینمایی.</p>
          <p className="flex items-center gap-1 font-latin">
            <span>Crafted for true cinema lovers</span>
            <Heart className="w-3 h-3 text-kadr-accent fill-kadr-accent" />
          </p>
        </div>

      </div>
    </footer>
  );
};
