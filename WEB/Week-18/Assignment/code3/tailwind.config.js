import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.text-shadow-sm': {
                    textShadow: '0 1px 2px rgb(0 0 0 / 0.15)',
                },
                '.text-shadow': {
                    textShadow: '0 2px 4px rgb(0 0 0 / 0.2)',
                },
                '.text-shadow-lg': {
                    textShadow: '0 4px 8px rgb(0 0 0 / 0.25)',
                },
            });
        }),
    ],
};