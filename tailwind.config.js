/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        highlight: 'var(--color-highlight)',
        'n-surface': 'var(--color-n-surface)',
        'n-accent': 'var(--color-n-accent)',
        'n-highlight': 'var(--color-n-highlight)',
        text: 'var(--color-text)'
      }
    },
  },
  plugins: [],
}

