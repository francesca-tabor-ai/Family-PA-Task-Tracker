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
      },
      transitionProperty: {
        "shadow": "box-shadow",
      },
    },
  },
  plugins: []
} satisfies Config;

