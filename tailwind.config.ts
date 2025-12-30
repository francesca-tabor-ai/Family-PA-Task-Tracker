import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#FAF8F5",
          text: "#402A2F",
          button: {
            light: "#E7E6E3",
            medium: "#D8D0C1",
            dark: "#CEC7BF",
          },
          primary: "#402A2F",
          success: "#4A7C59",
          neutral: "#E7E6E3",
          muted: "#8B7D7F",
        },
      },
      fontFamily: {
        heading: ["Bebas Neue", "sans-serif"],
        body: ["Rubik", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "heading-1": ["4rem", { lineHeight: "1", fontWeight: "700" }],
        "heading-2": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-3": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(64, 42, 47, 0.08)",
        "card-hover": "0 4px 12px rgba(64, 42, 47, 0.12)",
        "card-elevated": "0 4px 16px rgba(64, 42, 47, 0.1)",
      },
      transitionProperty: {
        "shadow": "box-shadow",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "highlight": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(64, 42, 47, 0.05)" },
          "100%": { backgroundColor: "transparent" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "highlight": "highlight 1.5s ease-in-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: []
} satisfies Config;

