/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effdf3', 100: '#d9fbe3', 200: '#b5f4c6', 300: '#81e89d',
          400: '#3fd96a', 500: '#1ec951', 600: '#12a83e', 700: '#0f8634',
          800: '#11652b', 900: '#0f5325',
        },
      },
      boxShadow: {
        card: '0 6px 24px rgba(15,23,42,0.07)',
        pop: '0 12px 32px rgba(18,168,62,0.18)',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: { floaty: 'floaty 5s ease-in-out infinite' },
    },
  },
  plugins: [],
}
