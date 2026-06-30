/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#0f1117',
        'ink-2': '#3d3f4a',
        'ink-3': '#7a7d8a',
        slate: '#f4f5f7',
        card: '#ffffff',
        border: '#e4e5ea',
        'border-2': '#c9cad2',
        brand: '#1a56f5',
        'brand-light': '#eef2ff',
        'brand-mid': '#c7d4fd',
        'brand-dark': '#1240c4',
        green: '#16a34a',
        'green-bg': '#f0fdf4',
        amber: '#d97706',
        'amber-bg': '#fffbeb',
        red: '#dc2626',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,17,23,0.06), 0 1px 2px rgba(15,17,23,0.04)',
        'card-hover': '0 4px 16px rgba(15,17,23,0.10), 0 1px 4px rgba(15,17,23,0.06)',
        hero: '0 24px 64px rgba(26,86,245,0.12), 0 8px 24px rgba(15,17,23,0.08)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
    },
  },
  plugins: [],
}
