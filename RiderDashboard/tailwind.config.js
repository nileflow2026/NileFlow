// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sunset: "#E25822",
        savanna: "#D9A566",
        earth: "#8C4B2F",
        clay: "#BF6B4B",
        sand: "#F2D5A0",
        mud: "#593527",
      },
    },
  },
  plugins: [],
};
