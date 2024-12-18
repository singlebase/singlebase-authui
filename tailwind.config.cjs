

/** @type {import('tailwindcss').Config} */
const { createThemes } = require('tw-colors');

const colors = require("tailwindcss/colors")

module.exports = {
  content: [
    //"./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    createThemes({
      dark: { 
        background: colors.slate['900'], // slate-900
        primary: colors.slate['200'], // slate-200
        secondary: colors.slate['400'], // slate-400
        text: colors.slate['400'], // slate-400
        
        'button-primary-bg': colors.sky['900'], // sky-900
        'button-primary-text': colors.slate['200'], // slate-200
        'button-primary-hover-bg': colors.slate['700'], // slate-700
        'button-primary-hover-text': colors.slate['200'], // slate-200

        'button-secondary-bg': colors.slate['800'], // slate-800
        'button-secondary-text': colors.slate['500'], // slate-500
        'button-secondary-hover-bg': colors.slate['800'], // slate-800
        'button-secondary-hover-text': colors.slate['300'], // slate-300
      },
      light: { 
        background: colors.slate['50'],
        primary: colors.slate['800'],
        secondary: colors.slate['700'],
        text: colors.slate['700'],

        'button-primary-bg': colors.slate['900'],
        'button-primary-text': colors.slate['300'],
        'button-primary-hover-bg': colors.slate['700'],
        'button-primary-hover-text': colors.slate['200'],

        'button-secondary-bg': colors.slate['200'],
        'button-secondary-text': colors.slate['600'], 
        'button-secondary-hover-bg': colors.slate['100'],
        'button-secondary-hover-text': colors.slate['600'],
      },
      rose: { 
        background: '#4c0519', // rose-900
        primary: '#e2e8f0', // slate-200
        secondary: '#94a3b8', // slate-400
        text: '#94a3b8', // slate-400
        'button-primary-bg': '#0c4a6e', // sky-900
        'button-primary-text': '#e2e8f0', // slate-200
        'button-primary-hover-bg': '#334155', // slate-700
        'button-primary-hover-text': '#e2e8f0', // slate-200

        'button-secondary-bg': '#1e293b', // slate-800
        'button-secondary-text': '#64748b', // slate-500
        'button-secondary-hover-bg': '#1e293b', // slate-800
        'button-secondary-hover-text': '#cbd5e1', // slate-300
      }
    }, {defaultTheme: 'dark'})
  ],
}

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     //"./index.html",
//     "./src/**/*.{vue,js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
//   plugins: [
//     require("@tailwindcss/forms"),
//     require("@tailwindcss/typography"),
//     require("@tailwindcss/aspect-ratio")
//   ],
// }