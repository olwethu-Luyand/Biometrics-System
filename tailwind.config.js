/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0062AD',
        primeoak: {
          blue: '#0062AD',
          red: '#C8102E',
          dark: '#1E293B',
          gray: {
            bg: '#F8FAFC',
            border: '#E2E8F0',
            tab: '#E5E7EB',
            text: '#6B7280',
          },
        },
      },
    },
  },
  plugins: [],
}
