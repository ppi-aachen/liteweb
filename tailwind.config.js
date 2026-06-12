/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0061BF',
          dark: '#004E99',
          light: '#3482CC',
        },
        dark: '#212121',
        'light-gray': '#EDEDED',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      fontSize: {
        'h1-desktop': '34pt',
        'h1-tablet': '29pt',
        'h1-mobile': '24pt',
        'h2-desktop': '19pt',
        'h2-tablet': '17pt',
        'h2-mobile': '15pt',
        'h3-desktop': '15pt',
        'h3-tablet': '14pt',
        'h3-mobile': '13pt',
        'body': '11pt',
        'nav': '15pt',
        'nav-sub': '12pt',
        'small': '9pt',
      },
      spacing: {
        'sidebar': '250px',
      },
      screens: {
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1280px',
      },
      spacing: {
        'nav-height': '64px',
      },
    },
  },
  plugins: [],
}
