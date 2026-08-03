/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0066FF',
          dark: '#0052CC',
        },
      },
    },
  },
  plugins: [],
};
