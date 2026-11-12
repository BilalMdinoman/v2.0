import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#040a13",
          bg2: "#071220",
          panel: "#0a1a2e",
          border: "#16283f",
        },
        accent: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          teal: "#14b8a6",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
