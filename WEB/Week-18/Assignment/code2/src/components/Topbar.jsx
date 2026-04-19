import { useState, useEffect } from 'react';

export default function Topbar({ onMenuClick }) {
    const [isDark, setIsDark] = useState(
        () => document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden md:block">
                Dashboard
            </h1>

            <button
                onClick={() => setIsDark((prev) => !prev)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
            >
                {isDark ? '☀️' : '🌙'}
            </button>
        </header>
    );
}