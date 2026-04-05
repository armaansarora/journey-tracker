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
        bg: "#FFFFFF",
        surface: "#F9FAFB",
        "surface-hover": "#F3F4F6",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
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
