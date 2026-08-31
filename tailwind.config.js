/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0272c7',
          700: '#035ba1',
          800: '#074d85',
          900: '#0b416e',
          950: '#072a4a',
        },
        luxury: {
          dark: '#0b0f19',
          navy: '#0f172a',
          card: '#1e293b',
          cardLight: '#ffffff',
          accent: '#d97706',
          gold: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          border: '#e2e8f0',
          borderDark: '#334155'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Hind Siliguri"', 'Inter', 'sans-serif'],
        bengali: ['"Hind Siliguri"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'card-hover': '0 20px 35px -10px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(12, 143, 233, 0.35)'
      }
    },
  },
  plugins: [
    forms,
    typography
  ],
}
