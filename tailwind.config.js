/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: "#0B0F0C",
          deeper: "#080C09",
        },
        pickleball: {
          lime: "#C6FF00",
          limeLight: "#D8F33C",
          limeDark: "#94C400",
          court: "#1E3A2B",
          kitchen: "#162B20",
          surface: "#141C16",
          surfaceHighlight: "#1B261F",
          border: "#233327",
          borderLight: "#344B3A",
          attention: "#FFD600",
        },
        teamA: {
          DEFAULT: "#00E5FF",
          subtle: "rgba(0, 229, 255, 0.12)",
          border: "rgba(0, 229, 255, 0.3)",
        },
        teamB: {
          DEFAULT: "#FF9100",
          subtle: "rgba(255, 145, 0, 0.12)",
          border: "rgba(255, 145, 0, 0.3)",
        },
        highContrast: "#F5F7F6",
        mutedText: "#8E9E94",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
