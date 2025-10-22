/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
// import colors from 'tailwindcss/colors' // <-- REMOVED THIS LINE

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Manually define the colors needed for the theme
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      gray: { // Need gray for progress bar background
        700: '#374151',
      },
      green: { // Main theme color
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        900: '#064E3B',
      },
      red: { // Admin/Error color
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
      },
      cyan: { // Link color
        300: '#67E8F9',
        400: '#22D3EE',
        500: '#06B6D4',
        600: '#0891B2',
      },
      orange: { // Streak color
        300: '#FDBA74',
        400: '#FB923C',
      },
      yellow: { // Stop button color
          500: '#EAB308',
      }
    },
    extend: {
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