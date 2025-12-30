import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#ffffff",
          text: "#37352f",
          textMuted: "#787774",
          border: "#e3e2e0",
          hover: "#f7f6f3",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        notion: "6px",
        notionInput: "8px",
      },
      maxWidth: {
        notion: "840px",
      },
      spacing: {
        notion: "48px",
      },
    },
  },
  plugins: []
} satisfies Config;

