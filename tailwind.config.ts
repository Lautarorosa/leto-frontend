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
        // ── LETO Brand Colors ─────────────────────────────────────────────
        brand: {
          DEFAULT: '#10B981',   // primary CTA — emerald professional
          light:   '#34D399',   // lighter variant
          mid:     '#059669',   // hover states
          dark:    '#047857',   // active / pressed
          // scale
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',  // brand.500 = primary
          600: '#059669',  // brand.600 = hover
          700: '#047857',  // brand.700 = active
          800: '#065f46',
          900: '#064e3b',
        },
        // ── Neutrals ─────────────────────────────────────────────────────
        leto: {
          black:   '#000000',   // pure black bg (dark mode)
          surface: '#101215',   // card / surface (dark mode)
          gray:    '#54565b',   // borders, dividers
          muted:   '#888d92',   // secondary text (dark)
          text:    '#ececec',   // primary text (dark mode)
        },
        // ── Semantic ─────────────────────────────────────────────────────
        success: '#10b981',   // aligned with brand
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },
      // ── Spacing (8pt grid) ────────────────────────────────────────────
      spacing: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
        '3xl':'48px',
      },
      // ── Border radius ─────────────────────────────────────────────────
      borderRadius: {
        xs:  '4px',
        sm:  '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
      // ── Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        xs:    '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        sm:    '0 1px 3px 0 rgb(0 0 0 / 0.5)',
        md:    '0 4px 6px -1px rgb(0 0 0 / 0.5)',
        lg:    '0 10px 15px -3px rgb(0 0 0 / 0.5)',
        xl:    '0 20px 25px -5px rgb(0 0 0 / 0.5)',
        green: '0 0 20px rgba(16, 185, 129, 0.25)',
        'green-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
      },
      // ── Animations ────────────────────────────────────────────────────
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,214,65,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,214,65,0.5)' },
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
      // ── Screens ───────────────────────────────────────────────────────
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
