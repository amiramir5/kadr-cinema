/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark cinema background
        'kadr-bg': '#0d0d1a',
        'kadr-bg-2': '#12122a',
        'kadr-bg-3': '#1a1a3e',
        // Brand
        'kadr-primary': '#7c6af7',
        'kadr-primary-hover': '#6a58e5',
        'kadr-primary-light': 'rgba(124,106,247,0.15)',
        // Accent
        'kadr-accent': '#f97b6b',
        'kadr-accent-hover': '#e56955',
        'kadr-accent-light': 'rgba(249,123,107,0.15)',
        // Text
        'kadr-text': '#f0eeff',
        'kadr-text-muted': '#9491b4',
        // Glass surfaces
        'kadr-surface': 'rgba(255,255,255,0.06)',
        'kadr-surface-hover': 'rgba(255,255,255,0.10)',
        // Borders
        'kadr-border': 'rgba(255,255,255,0.10)',
        'kadr-border-hover': 'rgba(255,255,255,0.20)',
        // Gold for ratings
        'kadr-gold': '#f5c842',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        latin: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        'glow-primary': '0 0 30px rgba(124,106,247,0.3)',
        'glow-accent': '0 0 30px rgba(249,123,107,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.7)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      borderRadius: {
        'cinema': '1rem',
        'cinema-lg': '1.5rem',
        'cinema-xl': '2rem',
        'cinema-pill': '9999px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '40px',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,106,247,0.25), transparent)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
