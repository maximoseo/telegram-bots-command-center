import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        'bg': 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-sunken': 'var(--bg-sunken)',
        
        // Text
        'text': 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        
        // Borders
        'line': 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'line-weak': 'var(--line-weak)',
        
        // Brand
        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-light': 'var(--primary-light)',
        
        // Semantic
        'success': 'var(--success)',
        'success-bg': 'var(--success-bg)',
        'warning': 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        'error': 'var(--error)',
        'error-bg': 'var(--error-bg)',
        'info': 'var(--info)',
        'info-bg': 'var(--info-bg)',
        
        // Sidebar
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-fg': 'var(--sidebar-fg)',
        'sidebar-fg-active': 'var(--sidebar-fg-active)',
        'sidebar-accent': 'var(--sidebar-accent)',
        
        // Legacy aliases
        'navy': '#0b1220',
        'panel': '#111827',
        'accent': '#4f46e5'
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'soft': '0 18px 60px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
