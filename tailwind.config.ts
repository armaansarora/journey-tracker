import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Swiss minimalism palette — teal primary, high contrast
        primary: { DEFAULT: "#0F766E", light: "#CCFBF1", dark: "#0D5F58" },
        accent: "#0369A1",
        surface: "#F8FAFC",
        border: "#E2E8F0",
        "t-primary": "#0F172A",
        "t-secondary": "#475569",
        "t-muted": "#94A3B8",
        success: { DEFAULT: "#059669", light: "#ECFDF5", border: "#A7F3D0" },
        warn: { DEFAULT: "#D97706", light: "#FFFBEB", border: "#FDE68A" },
        error: { DEFAULT: "#DC2626", light: "#FEF2F2", border: "#FECACA" },
        info: { DEFAULT: "#0369A1", light: "#F0F9FF", border: "#BAE6FD" },
      },
      borderRadius: { card: "12px", sm: "8px" },
      spacing: { card: "20px" },
    },
  },
  plugins: [],
};

export default config;
