// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdcff",
          300: "#8ec4ff",
          400: "#5ba5ff",
          500: "#2a84ff",
          600: "#1567e6",
          700: "#114fb4",
          800: "#103f8c",
          900: "#0f346f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
