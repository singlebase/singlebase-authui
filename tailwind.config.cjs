


/** @type {import('tailwindcss').Config} */
const { createThemes } = require('tw-colors');

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
      default: { 
        background: '#0f172a', // slate-900
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
      },
      light: { 
        background: '#fff', // white
        primary: '#334155', // slate-700
        secondary: '#475569', // slate-600
        text: '#475569', // slate-600
        'button-primary-bg': '#0f172a', // slate-900
        'button-primary-text': '#cbd5e1', // slate-300
        'button-primary-hover-bg': '#1e293b', // slate-700
        'button-primary-hover-text': '#e2e8f0', // slate-200

        'button-secondary-bg': '#f8fafc', // slate-50
        'button-secondary-text': '#64748b', // slate-500
        'button-secondary-hover-bg': '#f1f5f9', // slate-100
        'button-secondary-hover-text': '#475569', // slate-600
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
    }, {defaultTheme: 'default'})
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