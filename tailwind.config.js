/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--color-bg-base)',
        'bg-deep': 'var(--color-bg-deep)',
        'bg-card': 'var(--color-bg-card)',
        'bg-card-hover': 'var(--color-bg-card-hover)',
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'border-subtle': 'var(--color-border-subtle)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'display': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'stat': ['28px', { lineHeight: '1', fontWeight: '700' }],
      },
      borderRadius: {
        'nav': '999px',
        'card': '16px',
        'btn': '8px',
        'img': '8px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1)',
        'nav': '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1)',
        'modal': '0 16px 48px rgba(0,0,0,0.5)',
        'glow': '0 4px 20px rgba(212, 168, 83, 0.4)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'like-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '70%': { transform: 'scale(0.92)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'like-bounce': 'like-bounce 300ms ease-smooth',
      },
    },
  },
  plugins: [],
}
