/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#4CAF50',
          'light': '#81C784',
          'dark': '#2E7D32',
        },
        'secondary': {
          DEFAULT: '#1B5E20',
          'light': '#388E3C',
          'dark': '#0b6a3c',
        },
      },
    },
  },
  plugins: [],
} 