/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a4672',
        secondary: '#506dff',
        dark: '#202b4b',
        light: '#d1d4d6',
      },
    },
  },
}
