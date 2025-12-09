/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          surface2: '#334155',
          border: '#475569',
          text: '#f1f5f9',
          textMuted: '#cbd5e1',
        },
      },
    },
  },
  plugins: [],
}

