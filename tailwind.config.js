/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        student: {
          black: 'var(--student-black)',
          'black-2': 'var(--student-black-2)',
          'black-3': 'var(--student-black-3)',
          'black-4': 'var(--student-black-4)',
          'black-5': 'var(--student-black-5)',
          gold: 'var(--student-gold)',
          'gold-2': 'var(--student-gold-2)',
          'gold-3': 'var(--student-gold-3)',
          white: 'var(--student-white)',
          'white-dim': 'var(--student-white-dim)',
          red: 'var(--student-red)',
          green: 'var(--student-green)',
          blue: 'var(--student-blue)',
        }
      }
    },
  },
  plugins: [],
}