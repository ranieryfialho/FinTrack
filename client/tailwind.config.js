/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#0E0E0E',      // Fundo mais escuro
        'dark-bg-secondary': '#191919',   // Fundo principal
        'dark-card': '#252525',           // Cor dos cards e componentes
        'dark-border': '#3E3E3E',         // Cor para bordas e divisórias
        'dark-text-secondary': '#878787', // Texto cinza, ícones
        'dark-text-primary': '#F3F3F3',     // Texto principal, branco
      }
    },
  },
  plugins: [],
}