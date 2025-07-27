import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4C6FFF",
        accent: "#00C896",
        danger: "#FF5F5F",
        background: "#FAFAFA",
        text: "#1E1E1E",
        modal: "#FFFFFF",
        success: "#00C896",
        warning: "#FFB800",
        info: "#4C6FFF",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
