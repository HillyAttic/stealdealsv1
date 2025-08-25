/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-jost)', 'system-ui', 'sans-serif'],
        'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        'jost': ['var(--font-jost)', 'sans-serif'],
        'cooper-black': ['Cooper Black', 'Arial Black', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#154D71',
          50: '#E6F0F7',
          100: '#CCE1EE',
          200: '#99C3DD',
          300: '#66A5CC',
          400: '#3387BB',
          500: '#154D71',
          600: '#113E5A',
          700: '#0D2E43',
          800: '#081F2C',
          900: '#041015',
          950: '#020B0D'
        },
        secondary: {
          DEFAULT: '#1C6EA4',
          50: '#E8F3FB',
          100: '#D0E6F7',
          200: '#A1CEEF',
          300: '#72B5E7',
          400: '#439DDF',
          500: '#1C6EA4',
          600: '#165883',
          700: '#114262',
          800: '#0B2C41',
          900: '#061620',
          950: '#030B10'
        },
        accent: {
          DEFAULT: '#33A1E0',
          50: '#EBF6FD',
          100: '#D7EDFA',
          200: '#AFDCF6',
          300: '#87CAF1',
          400: '#5FB8ED',
          500: '#33A1E0',
          600: '#2981B3',
          700: '#1F6186',
          800: '#154059',
          900: '#0A202C',
          950: '#051016'
        },
        highlight: {
          DEFAULT: '#FFF9AF',
          50: '#FFFEF7',
          100: '#FFFCEE',
          200: '#FFF9DD',
          300: '#FFF6CC',
          400: '#FFF3BB',
          500: '#FFF9AF',
          600: '#FFED66',
          700: '#FFE41D',
          800: '#D4BE00',
          900: '#8B7E00',
          950: '#5C5300'
        }
      },
      animation: {
        'carousel': 'carousel 30s linear infinite',
      },
      keyframes: {
        carousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}; 