/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bricolage: ["'Bricolage Grotesque'", 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'text-primary': '#303030',
        'text-secondary': 'rgba(94, 94, 94, 0.8)',
        'text-dark': '#5E5E5E',
        'text-muted': 'rgba(94, 94, 94, 0.55)',
        'disabled': '#A9A9A9',
        'bg-white': '#FFFFFF',
        'bg-offwhite': '#F0F0F0',
        'bg-offwhite-50': '#CECECE',
        'bg-gradient-top': '#EEEEEE',
        'bg-gradient-bottom': '#DADADA',
        'bg-disabled': '#A9A9A9',
        'btn-primary': '#181818',
        'btn-dark': '#272727',
        'btn-orange': '#FF5623',
        'accent-green': '#17CB9E',
        'accent-red': '#FF4040',
        'navy': '#011625',
        'light-navy': '#417BA4',
        'grey2': '#D5D5D5',
        'grey3': '#E1DCEB',
        'grey4': '#CCC6D9',
        /* Keep old colors for other pages */
        ink: {
          DEFAULT: '#0A0A0F',
          50: '#F5F5F7',
          100: '#E8E8EE',
          200: '#C8C8D8',
          300: '#9898B0',
          400: '#686888',
          500: '#444460',
          600: '#2A2A48',
          700: '#1A1A30',
          800: '#0F0F20',
          900: '#0A0A0F',
        },
        jade: {
          DEFAULT: '#00C896',
          50: '#E6FFF8',
          500: '#00C896',
          700: '#006D52',
        },
        amber: {
          DEFAULT: '#F5A623',
          500: '#F5A623',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          500: '#FF6B6B',
        },
      },
      boxShadow: {
        'sidebar': '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)',
        'card': '0px 20px 30px rgba(146, 146, 146, 0.19)',
        'cloud': '6px 4px 13px rgba(27, 119, 139, 0.09)',
        'btn-glow': '0px 16px 48px rgba(255, 255, 255, 0.12), 0px 32px 48px rgba(255, 255, 255, 0.2), inset 0px -1px 3.5px rgba(177, 177, 177, 0.6), inset 0px 0px 34.5px rgba(255, 255, 255, 0.25)',
        'realistic': '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '4xl': '24px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
