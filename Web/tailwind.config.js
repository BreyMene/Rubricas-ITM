/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: "Zain, serif",
      },
      colors: {
        // Light Version
        "Dark-Blue": "#2a3465",
        "White-w": "#ffffff",
        "Medium-Blue": "#3b4a8a",
        "Purple-P": "#523a72",

        // Dark Version
        "Dark-Grey": "#383332",
        "Light-Gray": "#d3d3d3",
        "Medium-Gray": "#544f4c",
        "Muted-Brown": "#6b5e5a",

        //Backgrounds
        "Warm-Dark": "#0B0B0B",
        "Pure-Black": "#000000"
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}

