import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: { 700: '#374151' },
        green: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          900: '#064E3B',
        },
        red: { 400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
        cyan: { 300: '#67E8F9', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2' },
        orange: { 300: '#FDBA74', 400: '#FB923C' },
        yellow: { 500: '#EAB308' },
      },
      fontFamily: {
        'mono': ['"Fira Code"', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      }
    },
  },
  plugins: [],
}
