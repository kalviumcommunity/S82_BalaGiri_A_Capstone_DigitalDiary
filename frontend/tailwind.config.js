/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: 'var(--color-page-bg)',
          text: 'var(--text-primary)',
          primary: 'var(--color-primary)',
          hover: 'var(--color-highlight)',
          card: 'var(--color-card-bg)',
          border: 'var(--color-border)',
        }
      },
      boxShadow: {
        theme: '0 8px 32px var(--shadow-color)',
      }
    },
  },
  plugins: [],
};
