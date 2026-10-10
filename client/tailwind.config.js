/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Merriweather"', "system-ui", "sans-serif"],
        display: ["Poppins", '"Merriweather"', "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease both",
      },
      colors: {
        primary: "#10b981",
        primaryHover: "#059669",
        accent: "#14b8a6",
        accentHover: "#0d9488",
        ivory: "#faf8f4",
      },
    },
  },
  plugins: [],
};
