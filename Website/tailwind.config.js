/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./Context/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A35527",
        secondary: "#F9DCC0",
        accent: "#C87F4E",
        darkText: "#2D1B14",
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "slide-out-right": "slideOutRight 0.3s ease-out forwards",
        "countdown-bar": "countdownBar 5s linear forwards",
        "pulse-notification": "pulseNotification 2s infinite",
        "bounce-notification": "bounceNotification 0.6s ease-out",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        countdownBar: {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
        pulseNotification: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)" },
        },
        bounceNotification: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -30px, 0)" },
          "70%": { transform: "translate3d(0, -15px, 0)" },
          "90%": { transform: "translate3d(0, -4px, 0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
