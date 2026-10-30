/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kadr-bg': '#F6F3EB',
        'kadr-primary': '#355E4B',
        'kadr-primary-hover': '#2a4c3c',
        'kadr-primary-light': '#E9EFEA',
        'kadr-accent': '#C8795A',
        'kadr-accent-hover': '#b6684b',
        'kadr-accent-light': '#FDF3EE',
        'kadr-text': '#252922',
        'kadr-text-muted': '#73776F',
        'kadr-surface': '#FFFFFF',
        'kadr-border': '#E6E1D8',
        'kadr-border-hover': '#D5CEC3',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        latin: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cinema-subtle': '0 2px 8px -2px rgba(37, 41, 34, 0.05)',
        'cinema-card': '0 4px 16px -4px rgba(37, 41, 34, 0.07)',
        'cinema-elevated': '0 12px 32px -8px rgba(37, 41, 34, 0.12)',
      },
      borderRadius: {
        'cinema': '1rem',
        'cinema-lg': '1.25rem',
        'cinema-pill': '9999px',
      }
    },
  },
  plugins: [],
}
