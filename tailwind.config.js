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
          bg: "#F5F6FC", // Main Background: Soft Periwinkle Off-White
          card: "#FFFFFF", // Card Background: Pure White
          navbar: "#241B52", // Navbar: Deep Royal Indigo
          heroFrom: "#241B52", // Hero Start: Deep Royal Indigo
          heroTo: "#4338CA", // Hero End: Royal Iris Indigo
          primary: "#4F46E5", // Primary Button & Active Pill: Vibrant Iris
          primaryHover: "#4338CA", // Button Hover: Darker Indigo
          accent: "#818CF8", // Soft Iris Accent
          coral: "#FB923C", // Warm Highlight: Peach / Coral
          navy: "#0F172A", // Main Text: Deep Navy
          slate: "#64748B", // Secondary Text: Slate Gray
          border: "#E0E7FF", // Border: Soft Indigo Slate
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
