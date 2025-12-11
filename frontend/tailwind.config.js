/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-dark': '#5D5D5D',
        'pastel-medium': '#B8B8B8',
        'pastel-light': '#F5F5F5',
        'pastel-accent': '#AEC6CF',
        'pastel-accent-dark': '#8BA9B0',
        // Zomato-like colors
        'zomato-red': '#e84242',
        'zomato-red-hover': '#d13b3b',
        'dark-gray': '#333333',
        'light-gray': '#f8f8f8',
        'medium-gray': '#666666',
      }
    },
  },
  plugins: [],
}