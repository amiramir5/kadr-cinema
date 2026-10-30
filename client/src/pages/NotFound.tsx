import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-kadr-primary-light text-kadr-primary flex items-center justify-center mx-auto">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-kadr-text">صفحه مورد نظر پیدا نشد</h1>
      <p className="text-xs text-kadr-text-muted">
        شاید این فریم از فیلم کات خورده است! به صفحه اصلی کادر بازگردید.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-cinema-pill bg-kadr-primary text-white text-xs font-bold hover:bg-kadr-primary-hover transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>بازگشت به خانه</span>
      </Link>
    </div>
  );
};
