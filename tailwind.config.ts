import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#15803d',
          light:   '#15803d',
          mid:     '#166534',
          dark:    '#166534',
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#15803d',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#064e3b',
        },
        leto: {
          black:   '#000000',
          surface: '#101215',
          gray:    '#54565b',
          muted:   '#888d92',
          text:    '#ececec',
        },
        success: '#15803d',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },
      spacing: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
        '3xl':'48px',
      },
      borderRadius: {
        xs:  '4px',
        sm:  '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        xs:    '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        sm:    '0 1px 3px 0 rgb(0 0 0 / 0.5)',
        md:    '0 4px 6px -1px rgb(0 0 0 / 0.5)',
        lg:    '0 10px 15px -3px rgb(0 0 0 / 0.5)',
        xl:    '0 20px 25px -5px rgb(0 0 0 / 0.5)',
        green: '0 0 20px rgba(16, 185, 129, 0.25)',
        'green-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'fade-in':    'fadeIn 500ms ease-out',
        'slide-up':   'slideUp 500ms ease-out',
        'slide-down': 'slideDown 500ms ease-out',
        'scale-in':   'scaleIn 500ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 3s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite',
        'spin-fast':  'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16,185,129,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(16,185,129,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        container: '1280px',
        form: '480px',
        text: '65ch',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;
