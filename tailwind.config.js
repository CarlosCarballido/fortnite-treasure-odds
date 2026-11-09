/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fn: {
          dark: '#070c18',
          card: '#0e1628',
          cardBorder: '#1c2944',
          cardHover: '#142038',
          navy: '#0b1329',
          gold: '#eab308',
          goldLight: '#fde047',
          goldGlow: 'rgba(234, 179, 8, 0.25)',
          turquoise: '#06b6d4',
          purple: '#8b5cf6',
          supreme: '#ec4899',
          major: '#f59e0b',
          standard: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        gaming: ['Rajdhani', 'Trebuchet MS', 'Impact', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(234, 179, 8, 0.3)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'purple-glow': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
}

