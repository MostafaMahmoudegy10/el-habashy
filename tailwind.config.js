/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Cairo", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.10)",
        card: "0 10px 28px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
