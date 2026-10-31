/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Editorial Cinema palette based on reference design
        'kadr-bg': '#F6F3EB',
        'kadr-card': '#EFECE4',
        'kadr-surface': '#FFFFFF',
        'kadr-primary': '#9E3039', // Cinema red
        'kadr-primary-hover': '#86252D',
        'kadr-primary-light': 'rgba(158, 48, 57, 0.08)',
        'kadr-accent': '#C0392B',
        'kadr-dark': '#1C1E21',
        'kadr-text': '#1C1E21',
        'kadr-text-muted': '#7A7E85',
        'kadr-border': '#E4DFD5',
        'kadr-border-hover': '#D2CBC0',
        'kadr-gold': '#F39C12',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        latin: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        'float': '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'cinema': '1.25rem',
        'cinema-lg': '1.75rem',
        'cinema-xl': '2.25rem',
        'cinema-pill': '9999px',
      },
    },
  },
  plugins: [],
}
