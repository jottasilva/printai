import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Map Stitch colors
        "surface": "#f7f9fb",
        "surface-container": "#e8eff3",
        "surface-container-low": "#f0f4f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e1e9ee",
        "surface-container-highest": "#d9e4ea",
        "on-surface": "#2a3439",
        "on-surface-variant": "#566166",
        "outline": "#717c82",
        "outline-variant": "#a9b4b9",
        primary: {
          DEFAULT: "#565e74",
          foreground: "#f7f7ff",
          dim: "#4a5268",
          container: "#dae2fd",
          "on-container": "#4a5167",
        },
        secondary: {
          DEFAULT: "#506076",
          dim: "#44546a",
          container: "#d3e4fe",
          "on-container": "#435368",
        },
        tertiary: {
          DEFAULT: "#742fe5",
          dim: "#681ad9",
          container: "#8342f4",
          "on-container": "#ffffff",
        },
        error: {
          DEFAULT: "#9f403d",
          dim: "#4e0309",
          container: "#fe8983",
          "on-container": "#752121",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        headline: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        xl: "0.75rem",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)", opacity: "0.3" },
          "25%": { transform: "translateY(-20px) translateX(10px)", opacity: "0.6" },
          "50%": { transform: "translateY(-10px) translateX(-10px)", opacity: "0.4" },
          "75%": { transform: "translateY(-30px) translateX(5px)", opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "float": "float 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
