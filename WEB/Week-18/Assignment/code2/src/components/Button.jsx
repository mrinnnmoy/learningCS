import clsx from 'clsx';

const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
};

export default function Button({ variant = 'primary', children, className, ...props }) {
    return (
        <button
            className={clsx(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}