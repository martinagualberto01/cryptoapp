/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          400: '#a3e635',
        },
        yellow: {
          400: '#fde047',
        },
        gray: {
          900: '#18181b',
          950: '#09090b',
          800: '#27272a',
        },
      },
    },
  },
  plugins: [],
}

