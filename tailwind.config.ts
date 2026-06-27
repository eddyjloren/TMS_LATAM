import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcdcff",
          300: "#8ec5ff",
          400: "#57a4ff",
          500: "#2f7dff",
          600: "#1b5ff0",
          700: "#1549c4",
          800: "#173f9b",
          900: "#17387a",
          950: "#102352"
        }
      }
    }
  },
  plugins: []
};

export default config;
