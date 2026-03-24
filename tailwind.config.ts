import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // semantic cyber palette
        cyan: {
          DEFAULT: "#06b6d4",
          dim: "rgba(6,182,212,0.15)",
          border: "rgba(6,182,212,0.25)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        mono: ["'Geist Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to:   { opacity: "1", transform: "translateX(0)"    },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to:   { opacity: "1", transform: "scale(1)"    },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
        "glow-pulse-green": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(34,197,94,0.4), 0 0 2px rgba(34,197,94,0.3)"  },
          "50%":       { boxShadow: "0 0 28px rgba(34,197,94,0.75), 0 0 8px rgba(34,197,94,0.5)" },
        },
        "glow-pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(6,182,212,0.3), 0 0 2px rgba(6,182,212,0.2)"  },
          "50%":       { boxShadow: "0 0 28px rgba(6,182,212,0.65), 0 0 8px rgba(6,182,212,0.4)" },
        },
        scan: {
          "0%":   { top: "-4px", opacity: "0" },
          "5%":   { opacity: "1" },
          "95%":  { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
      },
      animation: {
        "fade-up":         "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in":        "slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":        "scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
        blink:             "blink 1s step-end infinite",
        "glow-green":      "glow-pulse-green 2.2s ease-in-out infinite",
        "glow-cyan":       "glow-pulse-cyan 2.2s ease-in-out infinite",
        scan:              "scan 2.4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
