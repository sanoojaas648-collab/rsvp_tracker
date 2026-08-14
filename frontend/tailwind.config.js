/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/context/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#f7f2e7',
        'ivory-dim': '#ece3cf',
        'ivory-line': '#ddd0ab',
        ink: '#17211d',
        forest: {
          DEFAULT: '#0f2a23',
          deep: '#081a15',
          mid: '#1c4438',
          soft: '#e8efe9'
        },
        gold: {
          DEFAULT: '#b48b4d',
          soft: '#e8dcc0',
          dim: '#8c6c39'
        },
        clay: '#9c4a3c'
      },
      fontFamily: {
        display: ['Georgia', '"Times New Roman"', 'serif'],
        body: ['"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      letterSpacing: {
        widest2: '0.28em'
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,42,35,0.05), 0 10px 28px -16px rgba(15,42,35,0.20)',
        ticket: '0 1px 0 rgba(180,139,77,0.4)'
      }
    }
  },
  plugins: []
};
