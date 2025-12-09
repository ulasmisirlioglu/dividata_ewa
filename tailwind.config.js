/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hb: {
          paper: '#F7F7F7', // Main background
          white: '#FFFFFF',
          ink: '#111111',   // Primary text
          gray: '#666666',  // Secondary text
          line: '#E0E0E0',  // Borders/Grid lines
          accent: '#333333' // Decorative elements
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Inter Tight"', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.04em',
      }
    },
  },
  plugins: [],
}
