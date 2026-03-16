/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          offset: 'var(--color-surface-offset)',
        },
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',
        brent: 'var(--color-brent)',
        wti: 'var(--color-wti)',
        spike: 'var(--color-spike)',
        crash: 'var(--color-crash)',
        elevated: 'var(--color-elevated)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
};
