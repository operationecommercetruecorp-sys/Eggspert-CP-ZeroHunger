import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sarabun)', 'sans-serif'],
      },
      colors: {
        // Engineering-spec.md "Design tokens"
        primary: {
          DEFAULT: '#14663C',
          dark: '#0F4F2E',
        },
        eggshell: '#F7F1E3',
        canvas: '#F5F1E8',
        border: {
          DEFAULT: '#E3D9C2',
          soft: '#EFE6D2',
          faint: '#F0EAD8',
        },
        ink: {
          DEFAULT: '#1C1A17',
          body: '#4a4436',
          muted: '#6B6459',
          faint: '#9a9284',
          fainter: '#b3ab9c',
        },
        gold: '#E8A33D',
        success: {
          DEFAULT: '#2F8F55',
          bg: '#E7F1E9',
        },
        warning: {
          DEFAULT: '#8a6a1c',
          bg: '#FBF0DC',
        },
        error: {
          DEFAULT: '#B3413E',
          bg: '#FBEAE9',
        },
      },
      borderRadius: {
        card: '16px',
        'card-sm': '12px',
        btn: '10px',
        'btn-sm': '8px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06)',
        'card-lg': '0 6px 20px rgba(28,26,23,.07)',
        modal: '0 24px 60px rgba(0,0,0,.3)',
      },
    },
  },
  plugins: [],
};
export default config;
