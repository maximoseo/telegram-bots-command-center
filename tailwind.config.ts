import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0b1220',
        panel: '#111827',
        accent: '#4f46e5'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
