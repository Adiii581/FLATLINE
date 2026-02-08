/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bio-black': '#050505',
        'bio-green': '#0f0',
        'bio-dark-green': '#003300',
        'bio-orange': '#ffaa00',
        'bio-red': '#ff3333',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}