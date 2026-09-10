/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'dice-roll': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '20%': { transform: 'rotate(-18deg) scale(1.1)' },
          '40%': { transform: 'rotate(14deg) scale(0.94)' },
          '60%': { transform: 'rotate(-10deg) scale(1.06)' },
          '80%': { transform: 'rotate(6deg) scale(0.98)' },
          '100%': { transform: 'rotate(0deg) scale(1)' },
        },
        'dice-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'dice-roll': 'dice-roll 450ms ease-in-out',
        'dice-spin': 'dice-spin 500ms linear',
      },
    },
  },
  plugins: [],
}
