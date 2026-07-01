import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220", panel: "#111b2e", edge: "#1e2b45",
        teal: "#2dd4bf", amber: "#f59e0b", navy: "#1f3355",
      },
    },
  },
  plugins: [],
};
export default config;
