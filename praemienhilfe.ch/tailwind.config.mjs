/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0087A0', dark: '#005F73', light: '#E8F4F8' },
        amber: { DEFAULT: '#F0A500', light: '#FFF8E7' },
        swiss: { red: '#CC0000', green: '#3D8B37' },
        dark: '#1A1A2A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
