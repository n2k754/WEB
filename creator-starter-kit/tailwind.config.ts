import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#09090F", 50: "#12121C", 100: "#171724", 200: "#1E1E2E" },
        violet: { brand: "#8B5CF6" },
        indigo: { brand: "#6366F1" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(139,92,246,0.55)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 50px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { float: "float 6s ease-in-out infinite", shimmer: "shimmer 1.6s infinite" },
    },
  },
  plugins: [],
};
export default config;
