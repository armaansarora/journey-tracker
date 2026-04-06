import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        green: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          border: "#A7F3D0",
        },
        blue: {
          DEFAULT: "#2563EB",
          light: "#EFF6FF",
          border: "#DBEAFE",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          border: "#FDE68A",
        },
        red: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          border: "#FECACA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
