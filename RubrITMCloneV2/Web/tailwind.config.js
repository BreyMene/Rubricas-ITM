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
        "Medium-Blue": "#4e5ea3",
        "Purple-P": "#523a72",

        // Dark Version
        "Dark-Grey": "#2e2c2c",
        "Light-Gray": "#d3d3d3",
        "Medium-Gray": "#545250",
        "Muted-Brown": "#807467",

        //Backgrounds
        "Warm-Dark": "#0B0B0B",
        "Medium-Dark": "#171717",
        "Pure-Black": "#000000",
        "Warm-White": "#fafafa",
        "MLight-White": "#f3f4f6"
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}