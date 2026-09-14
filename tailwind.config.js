/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F6F8F7", // Main Background: Soft Cool White
          card: "#FFFFFF", // Card Background: Pure White
          navbar: "#065F52", // Navbar: Deep Emerald
          heroFrom: "#065F52", // Hero Start: Deep Emerald
          heroTo: "#0F8F78", // Hero End: Emerald Gradient
          primary: "#10B981", // Primary Button: Medical Green
          primaryHover: "#059669", // Button Hover: Dark Green
          navy: "#0F172A", // Main Text: Deep Navy
          slate: "#64748B", // Secondary Text: Slate Gray
          border: "#DDE8E3", // Border: Soft Gray Green
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
