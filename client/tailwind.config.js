/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NORMX AI - Charte graphique officielle
        normx: {
          'primary': '#0077B5',
          'dark': '#005A8C',
          'anthracite': '#1E1E1E',
          'gray': '#6B7280',
          'light': '#E5E7EB',
          'off-white': '#F5F7FA',
        },
        // Alias pour faciliter l'usage
        primary: {
          50: '#e6f3f9',
          100: '#cce7f3',
          200: '#99cfe7',
          300: '#66b7db',
          400: '#339fcf',
          500: '#0077B5', // Primary Blue
          600: '#005A8C', // Dark Blue
          700: '#004d78',
          800: '#003f64',
          900: '#003250',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#6B7280', // Gray Tech
          600: '#475569',
          700: '#334155',
          800: '#1E1E1E', // Anthracite
          900: '#0f172a',
        },
        // Couleurs d'alerte
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        'normx': '0 4px 6px rgba(0, 119, 181, 0.1)',
        'normx-lg': '0 10px 15px rgba(0, 119, 181, 0.15)',
      },
      borderRadius: {
        'normx': '8px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-up-delay-1': 'fadeInUp 0.6s ease-out 0.1s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.2s forwards',
        'fade-in-up-delay-3': 'fadeInUp 0.6s ease-out 0.3s forwards',
        'fade-in-up-delay-4': 'fadeInUp 0.6s ease-out 0.4s forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
