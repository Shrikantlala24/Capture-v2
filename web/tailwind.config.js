/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        mist: 'var(--mist)',
        sand: 'var(--sand)',
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        card: 'var(--card)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      boxShadow: {
        glow: '0 20px 50px rgba(19, 38, 33, 0.12)',
        soft: '0 12px 30px rgba(20, 34, 28, 0.12)',
      },
    },
  },
  plugins: [],
}
