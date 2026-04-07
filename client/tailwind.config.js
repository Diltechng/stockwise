/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0f0f0f",
          50: "#f5f5f0",
          100: "#e8e8e0",
          200: "#d0d0c4",
          300: "#a8a898",
          400: "#787868",
          500: "#545448",
          600: "#3c3c32",
          700: "#2a2a22",
          800: "#1a1a14",
          900: "#0f0f0a",
        },
        lime: {
          DEFAULT: "#c8f53c",
          50: "#f7fde8",
          100: "#edfac4",
          200: "#d8f580",
          300: "#c8f53c",
          400: "#b0e020",
          500: "#8ab814",
          600: "#6a9010",
          700: "#4e6c0e",
          800: "#354a0a",
          900: "#1e2c06",
        },
        amber: {
          DEFAULT: "#f5a623",
          alert: "#ef4444",
          warn: "#f59e0b",
          ok: "#22c55e",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
