import React, { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, Shield, Download, Upload, Trash2, Key, Film, ExternalLink, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { KadrApi } from '../services/api';

export const Settings: React.FC = () => {
  const {
    settings,
    stats,
    updateSettings,
    exportDataJson,
    importDataJson,
    clearAllUserData,
    clearSearchHistory,
  } = useUser();

  const [apiStatus, setApiStatus] = useState<{
    tmdbLive: boolean;
    omdbLive: boolean;
    llmLive: boolean;
    message: string;
  }>({
    tmdbLive: false,
    omdbLive: false,
    llmLive: false,
    message: '',
  });

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    KadrApi.getStatus()
      .then(res => {
        setApiStatus({
          tmdbLive: res.config.tmdbLive,
          omdbLive: res.config.omdbLive,
          llmLive: res.config.llmLive,
          message: res.message,
        });
      })
      .catch(() => {
        setApiStatus({
          tmdbLive: false,
          omdbLive: false,
          llmLive: false,
          message: 'عدم دسترسی به سرور محلی.',
        });
      });
  }, []);

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kadr-backup-${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('اطلاعات با موفقیت بازیابی شد!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header (Matching reference mockup exactly!) */}
      <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border shadow-cinema-subtle text-center space-y-4">
        
        {/* Avatar circle */}
        <div className="w-20 h-20 rounded-full mx-auto bg-kadr-primary-light border-2 border-kadr-primary flex items-center justify-center text-kadr-primary shadow-sm overflow-hidden">
          <User className="w-10 h-10" />
        </div>

        <div>
          <h2 className="font-extrabold text-xl text-kadr-text">کاربر دوست‌داشتنی</h2>
          <p className="text-xs text-kadr-text-muted mt-1">هر روز یه داستان جدید</p>
        </div>

        {/* Mini stats cards from mockup */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="bg-kadr-bg rounded-cinema p-3 border border-kadr-border">
            <span className="font-bold text-base font-latin text-kadr-text block">{stats.moviesWatched}</span>
            <span className="text-[10px] text-kadr-text-muted">فیلم دیده‌شده</span>
          </div>
          <div className="bg-kadr-bg rounded-cinema p-3 border border-kadr-border">
            <span className="font-bold text-base font-latin text-kadr-text block">{stats.seriesWatched}</span>
            <span className="text-[10px] text-kadr-text-muted">سریال دنبال‌شده</span>
          </div>
          <div className="bg-kadr-bg rounded-cinema p-3 border border-kadr-border">
            <span className="font-bold text-base font-latin text-kadr-accent block">{stats.inWatchlist}</span>
            <span className="text-[10px] text-kadr-text-muted">در لیست من</span>
          </div>
        </div>

      </div>

      {/* Preferences Section */}
      <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border shadow-cinema-subtle space-y-5">
        <div className="flex items-center gap-2 border-b border-kadr-border pb-3">
          <SettingsIcon className="w-5 h-5 text-kadr-primary" />
          <h3 className="font-bold text-base text-kadr-text">سلیقه و ترجیحات پیش‌فرض</h3>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Default Media Type */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-kadr-text block">نوع رسانه پیش‌فرض</span>
              <span className="text-kadr-text-muted text-xs">در جستجوها به طور پیش‌فرض روی چه گزینه‌ای تمرکز شود</span>
            </div>

            <div className="flex items-center gap-1 bg-kadr-bg p-1 rounded-cinema-pill border border-kadr-border text-xs">
              <button
                onClick={() => updateSettings({ defaultMediaType: 'all' })}
                className={`px-3 py-1 rounded-cinema-pill font-medium ${
                  settings.defaultMediaType === 'all' ? 'bg-kadr-surface text-kadr-primary font-bold shadow-sm' : 'text-kadr-text-muted'
                }`}
              >
                فیلم و سریال
              </button>
              <button
                onClick={() => updateSettings({ defaultMediaType: 'movie' })}
                className={`px-3 py-1 rounded-cinema-pill font-medium ${
                  settings.defaultMediaType === 'movie' ? 'bg-kadr-surface text-kadr-primary font-bold shadow-sm' : 'text-kadr-text-muted'
                }`}
              >
                فیلم سینمایی
              </button>
              <button
                onClick={() => updateSettings({ defaultMediaType: 'tv' })}
                className={`px-3 py-1 rounded-cinema-pill font-medium ${
                  settings.defaultMediaType === 'tv' ? 'bg-kadr-surface text-kadr-primary font-bold shadow-sm' : 'text-kadr-text-muted'
                }`}
              >
                مجموعه تلویزیونی
              </button>
            </div>
          </div>

          {/* Min Rating Threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-kadr-border/70">
            <div>
              <span className="font-bold text-kadr-text block">حداقل امتیاز پیش‌فرض آثار</span>
              <span className="text-kadr-text-muted text-xs">نمایش آثاری با نمره معتبر از مخاطبان جهانی</span>
            </div>

            <select
              value={settings.minRatingDefault}
              onChange={(e) => updateSettings({ minRatingDefault: parseFloat(e.target.value) })}
              className="bg-kadr-bg border border-kadr-border rounded-cinema-pill px-3 py-1 text-xs text-kadr-text outline-none"
            >
              <option value="6.5">امتیاز ۶.۵ به بالا</option>
              <option value="7.0">امتیاز ۷.۰ به بالا (پیشنهاد ما)</option>
              <option value="7.5">امتیاز ۷.۵ به بالا</option>
              <option value="8.0">امتیاز ۸.۰ به بالا (فقط شاهکارها)</option>
            </select>
          </div>

          {/* Family safe mode */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-kadr-border/70">
            <div>
              <span className="font-bold text-kadr-text block">حالت تماشای خانوادگی</span>
              <span className="text-kadr-text-muted text-xs">عدم نمایش محتوای با خشونت بالا و محدودیت سنی</span>
            </div>

            <button
              onClick={() => updateSettings({ familySafeMode: !settings.familySafeMode })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.familySafeMode ? 'bg-kadr-primary' : 'bg-kadr-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.familySafeMode ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* TMDB & Backend Status Card */}
      <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border shadow-cinema-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-kadr-border pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-kadr-accent" />
            <h3 className="font-bold text-base text-kadr-text">وضعیت ارائه‌دهنده داده‌های سینمایی (TMDB)</h3>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-latin font-bold ${
              apiStatus.tmdbLive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {apiStatus.tmdbLive ? 'TMDB LIVE CONNECTED' : 'CURATED STANDALONE MODE'}
          </span>
        </div>

        <p className="text-xs text-kadr-text-muted leading-relaxed">
          {apiStatus.message}
        </p>

        {!apiStatus.tmdbLive && (
          <div className="p-4 rounded-cinema bg-kadr-bg border border-kadr-border text-xs space-y-2">
            <span className="font-bold text-kadr-text block">نحوه فعال‌سازی دسترسی زنده به تمام آرشیو TMDB:</span>
            <p className="text-kadr-text-muted">
              ۱. وارد سایت رسمی <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-kadr-primary font-bold underline">themoviedb.org</a> شوید و یک حساب رایگان بسازید.
            </p>
            <p className="text-kadr-text-muted">
              ۲. از منوی تنظیمات کاربری بخش <strong>API</strong>، عبارت <strong>API Read Access Token</strong> را کپی کنید.
            </p>
            <p className="text-kadr-text-muted">
              ۳. در پوشه <code>server/.env</code> توکن را در متغیر <code>TMDB_API_READ_ACCESS_TOKEN</code> قرار دهید. نیازی به قرار دادن کلید در کدهای کلاینت نیست.
            </p>
          </div>
        )}
      </div>

      {/* Data Management & Privacy */}
      <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border shadow-cinema-subtle space-y-4">
        <div className="flex items-center gap-2 border-b border-kadr-border pb-3">
          <Shield className="w-5 h-5 text-kadr-primary" />
          <h3 className="font-bold text-base text-kadr-text">مدیریت داده‌ها و حریم خصوصی</h3>
        </div>

        <p className="text-xs text-kadr-text-muted leading-relaxed">
          تمامی لیست‌ها، یادداشت‌های خصوصی و تاریخچه‌ها منحصراً در مرورگر دستگاه شما ذخیره می‌شوند و هیچ اطلاعات شخصی به سرورهای خارجی ارسال نمی‌گردد.
          برای انتقال لیست‌ها به دستگاه دیگر، از خروجی پشتیبان (JSON) استفاده کنید.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-cinema-pill bg-kadr-bg hover:bg-kadr-primary-light text-kadr-text hover:text-kadr-primary text-xs font-bold border border-kadr-border transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>دریافت نسخه پشتیبان (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center gap-1.5 px-4 py-2 rounded-cinema-pill bg-kadr-bg hover:bg-kadr-primary-light text-kadr-text hover:text-kadr-primary text-xs font-bold border border-kadr-border transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>بازیابی از فایل پشتیبان</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          {/* Clear Search History */}
          <button
            onClick={() => {
              clearSearchHistory();
              alert('تاریخچه جستجو پاک شد.');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-cinema-pill bg-kadr-bg hover:bg-rose-50 text-kadr-text-muted hover:text-rose-600 text-xs font-medium border border-kadr-border transition-colors"
          >
            <span>پاک کردن تاریخچه جستجو</span>
          </button>

          {/* Reset All */}
          <button
            onClick={() => {
              if (confirm('آیا مطمئن هستید؟ تمام لیست‌های ذخیره‌شده و یادداشت‌ها حذف خواهند شد.')) {
                clearAllUserData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-cinema-pill text-rose-600 hover:bg-rose-50 text-xs font-medium border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف تمام اطلاعات شخصی</span>
          </button>
        </div>

        {importStatus && (
          <p className="text-xs font-bold text-emerald-600 mt-2">{importStatus}</p>
        )}
      </div>

      {/* Attribution & Legal notice (Required by TMDB) */}
      <div className="bg-kadr-surface rounded-cinema p-6 border border-kadr-border shadow-cinema-subtle space-y-3">
        <h3 className="font-bold text-sm text-kadr-text">درباره کادر (KADR) و حق تکثیر داده‌ها</h3>
        <p className="text-xs text-kadr-text-muted leading-relaxed">
          «کادر» یک پلتفرم مستقل برای کشف فیلم و سریال به زبان فارسی است. هدف ما این است که هر تماشاگر بدون اتلاف وقت میان انبوهی از دسته‌بندی‌های تکراری، اثری را بیابد که برازنده وقت و روحیه کنونی اوست.
        </p>
        <div className="p-3 bg-kadr-bg rounded-lg border border-kadr-border text-[11px] text-kadr-text-muted leading-relaxed">
          "This product uses the TMDB API but is not endorsed or certified by TMDB."
        </div>
      </div>

    </div>
  );
};
