/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ringOpacity: {
        DEFAULT: 0.5,
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
      },
    },
  },
  plugins: [],
} 