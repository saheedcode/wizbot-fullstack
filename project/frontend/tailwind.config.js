/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FB',
          100: '#DCE5F7',
          200: '#B4C6EC',
          300: '#7E9BDD',
          400: '#4A6BC4',
          500: '#28489E',
          600: '#1E3A8A',
          700: '#162C69',
          800: '#101F4C',
          900: '#0B1636',
        },
        ink: {
          50: '#F7F8FA',
          100: '#EEF0F4',
          200: '#DCE0E8',
          400: '#8992A3',
          600: '#4D5566',
          700: '#333B4C',
          800: '#20263380',
          900: '#151923',
        },
        accent: {
          teal: '#12B3A8',
          amber: '#F2A73B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21,25,35,0.04), 0 8px 24px -8px rgba(21,25,35,0.10)',
        panel: '0 1px 1px rgba(21,25,35,0.03), 0 20px 40px -16px rgba(43,38,110,0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.28s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-left': 'slide-in-left 0.28s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
