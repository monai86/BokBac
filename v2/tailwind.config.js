/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#030712',
        panel: '#13131a',
        accent: '#a78bfa',
        accent2: '#5cc8ff',
        good: '#10b981',
        warn: '#fbbf24',
        bad: '#ef4444',
      },
      fontFamily: {
        sans: ['"Inter"', '"Prompt"', '"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
