// Each value is "R G B" space-separated — required format for
// Tailwind's rgb(var(--x) / <alpha-value>) opacity-aware color pattern.
export const themes = {
    indigo: { name: 'Indigo', primary: '79 70 229' }, // indigo-600
    emerald: { name: 'Emerald', primary: '5 150 105' }, // emerald-600
    rose: { name: 'Rose', primary: '225 29 72' }, // rose-600
};

export const themeNames = Object.keys(themes);