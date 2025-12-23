/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#F2994A", // Cyber Orange
        "primary-hover": "#F2994A", // Keep same for now, or darken slightly
        "background-light": "#F3F4F6", // Legacy support
        "background-dark": "#0B0B0E", // Deep Space
        "surface-dark": "#141419", // Panel Background
        "surface-light": "#FFFFFF",
        "border-dark": "#2D2D35", // Subtle Border
        "border-light": "#E5E7EB",
        "accent-dark": "#23232A", // Input/Card BGs
        success: "#27AE60",
        danger: "#EB5757",
      },
      fontFamily: {
        display: ['"Rajdhani"', '"Noto Sans TC"', "sans-serif"],
        mono: ['"Roboto Mono"', "monospace"],
        sans: ['"Noto Sans TC"', "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 5px rgba(232, 130, 37, 0.2), 0 0 20px rgba(232, 130, 37, 0.1)",
      },
    },
  },
  plugins: [],
};
