import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0EB",
        charcoal: "#2D2D2D",
        burgundy: "#6B2D3E",
        "accent-green": "#4CD964",
        "card-border": "#333333",
        "mint-node": "#D4F5E0",
        "lavender-node": "#C7D2FE",
        "purple-line": "#818CF8",
        "ai-tag": "#4CAF7D",
        "review-tag": "#F08080",
        "dashed": "#CCCCCC",
      },
      fontFamily: {
        cursive: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
