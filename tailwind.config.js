/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#818CF8',
        },
        accent: '#10B981',
        highlight: '#F59E0B',
        surface: {
          light: '#FFFFFF',
          dark: '#151B2B',
        },
        category: {
          outdoors: '#16A34A',
          food: '#F97316',
          culture: '#A855F7',
          history: '#B45309',
          family: '#EC4899',
          hidden: '#0EA5E9',
          fitness: '#DC2626',
          nightlife: '#6366F1',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
