/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        scoop: {
          50:  '#FFF8F0',
          100: '#FFE8CC',
          200: '#FFD199',
          300: '#FFB566',
          400: '#FF9833',
          500: '#FF7A00',
          600: '#CC6200',
          700: '#994900',
          800: '#663100',
          900: '#331800',
        },
        ink: {
          50:  '#F5F4F2',
          100: '#E8E6E1',
          200: '#D1CDC4',
          300: '#B5AFA4',
          400: '#928B7E',
          500: '#6E6659',
          600: '#524D43',
          700: '#3A3630',
          800: '#231F1A',
          900: '#120F0B',
        }
      },
    },
  },
  plugins: [],
}
