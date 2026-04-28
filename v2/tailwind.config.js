/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        panel: '#13131a',
        accent: '#7c5cff',
        accent2: '#5cc8ff',
        good: '#34d399',
        warn: '#fbbf24',
        bad: '#f87171',
      },
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
