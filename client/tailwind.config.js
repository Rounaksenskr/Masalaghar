/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spice: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // warm turmeric/amber
          600: '#d97706',
          700: '#b45309', // terracotta/clove
          800: '#92400e',
          900: '#78350f',
        },
        herb: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d', // deep cardamom/curry leaf green
        },
        masala: {
          red: '#dc2626', // chilli red
          dark: '#1c1917',
          warmBg: '#fbfaf8',
        }
      },
    },
  },
  plugins: [],
}
