/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Noto Sans TC', 'Noto Sans JP', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        pastel: {
          blue: '#BBE5ED',
          pink: '#FFC1CC',
          yellow: '#FDF7B4',
          green: '#B5EAD7',
          purple: '#D9C3F0',
          orange: '#FFD6A5',
          mint: '#C7EDD2',
        }
      }
    },
  },
  plugins: [],
}