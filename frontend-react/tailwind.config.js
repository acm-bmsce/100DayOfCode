/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      ...colors, // Ensure all default Tailwind colors are available
      // If you need custom colors, define them here, e.g.,
      // 'primary': '#4f46e5', // A custom indigo
      // 'secondary': '#1e293b', // A custom slate
    },
    extend: {
      fontFamily: {
        // You can add a more modern sans-serif if 'system-ui' isn't what you want
        // 'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}