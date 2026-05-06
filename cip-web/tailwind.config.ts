import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#38BDF8', light: '#7DD3FC', dark: '#0284C7' },
        secondary: { DEFAULT: '#10B981', light: '#4ADE80', dark: '#059669' },
        success:   { DEFAULT: '#10B981' },
        warning:   { DEFAULT: '#F59E0B' },
        danger:    { DEFAULT: '#EF4444' },
        bg:        { DEFAULT: '#020617', 2: '#0F172A', 3: '#080C14', 4: '#000000' },
        card:      { DEFAULT: 'rgba(15, 23, 42, 0.6)' },
        border:    'rgba(255, 255, 255, 0.1)',
        'bg-dark': '#020617',
        'bg-darker': '#000000',
        mint: '#4ADE80',
        sky: '#38BDF8',
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        body:    ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        syne:    ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        inter:   ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'grad-brand':   'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
        'grad-success': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'grad-warn':    'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        'grad-card':    'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(14,165,233,0.02))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'slide-left': 'slideLeft 0.3s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'count-up':   'countUp 1s ease forwards',
        'spin-slow':  'spin 20s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'border-flow': 'border-flow 4s linear infinite',
        'shimmer':     'shimmer 4s linear infinite',
        'pulse-glow':  'pulse-glow 3s infinite alternate',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          to: { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          from: { boxShadow: '0 0 100px -20px rgba(74, 222, 128, 0.3)' },
          to: { boxShadow: '0 0 140px -5px rgba(74, 222, 128, 0.5)' },
        }
      },
      boxShadow: {
        'glow-primary':   '0 0 30px rgba(56, 189, 248, 0.4)',
        'glow-success':   '0 0 30px rgba(74, 222, 128, 0.4)',
        'glow-verdict':   '0 0 120px -10px rgba(74, 222, 128, 0.4), inset 0 0 20px rgba(74, 222, 128, 0.1)',
        'card-hover':     '0 30px 60px -12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
