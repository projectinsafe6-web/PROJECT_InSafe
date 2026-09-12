export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070912',
          900: '#0B0F1E',
          800: '#111630',
          700: '#1A1F3D',
          600: '#252B4F',
          500: '#3A4170',
          400: '#5A6196',
          300: '#8B92C4',
          200: '#B8BDD9',
          100: '#D8DBEF',
          50: '#EEF0FA',
        },
        brand: {
          50: '#E8FBF4',
          100: '#C7F5E2',
          200: '#90EBC8',
          300: '#54DCA9',
          400: '#2BC78F',
          500: '#14A877',
          600: '#0C8760',
          700: '#0A6A4D',
          800: '#0A543E',
          900: '#094433',
        },
        accent: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        info: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
