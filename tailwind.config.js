/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stj-gold': '#FFD700',
        'stj-green': '#4caf50',
      }
    },
  },
  plugins: [],
}