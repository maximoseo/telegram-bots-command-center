import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)'
      },
      colors: {
        dark: {
          bg: '#0f0f12',
          surface: '#1a1a22',
          card: '#22222e',
          border: '#2d2d3a',
          text: '#e4e4e7',
          muted: '#a1a1aa',
          accent: '#3b82f6'
        }
      }
    }
  },
  plugins: []
};

export default config;
