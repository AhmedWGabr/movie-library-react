import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tmdb-dark-blue': '#032541', // TMDB's primary dark blue
        'tmdb-accent': '#01b4e4',    // TMDB's teal/cyan accent
        'tmdb-light-blue': '#01b4e4', // Often used for highlights or primary actions
        'tmdb-green': '#1ed5a9',     // Accent green for ratings or positive actions
      },
      fontFamily: {
        // TMDB uses "Source Sans Pro", but we'll stick to Tailwind defaults or project specific fonts for now
        // If "Source Sans Pro" is desired, it needs to be imported in layout.tsx or globals.css
      },
    },
  },
  plugins: [],
};
export default config;
