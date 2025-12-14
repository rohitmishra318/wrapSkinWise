/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                  // Include the root HTML file
    "./src/**/*.{js,ts,jsx,tsx}",    // Include all JS/TS/React files
  ],
  darkMode: 'class',                // Enable dark mode using class strategy
  theme: {
    extend: {},
  },
  plugins: [],
}
