import type { Config } from "tailwindcss";

// Design tokens sourced from the Monad style reference (attached spec).
// Parchment canvas, serif headlines, mono body/UI — see that doc for the
// full rationale; this file just wires the tokens into Tailwind's scale.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f6f3f1",
        "lake-blue": "#2b59d1",
        "periwinkle-mist": "#cfdaf5",
        "sky-blue": "#a0b5eb",
        mint: "#a7fccd",
        coral: "#ff9473",
        gold: "#ecda98",
        crimson: "#f37a0a",
        "off-black": "#242424",
        ink: "#000000",
        graphite: "#4e4d4d",
        smoke: "#797776",
        ash: "#cecac8",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "40px",
        pill: "9999px",
        button: "100px",
      },
      boxShadow: {
        md: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
      },
      maxWidth: {
        page: "1432px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "status-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "status-pulse": "status-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
