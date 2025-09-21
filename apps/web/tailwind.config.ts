import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f9ff",
          100: "#e1f0ff",
          200: "#bde0ff",
          300: "#8ac7ff",
          400: "#4ca7ff",
          500: "#1c86ff",
          600: "#0063e6",
          700: "#004dc2",
          800: "#003a91",
          900: "#00265f"
        }
      }
    }
  },
  plugins: []
};

export default config;
