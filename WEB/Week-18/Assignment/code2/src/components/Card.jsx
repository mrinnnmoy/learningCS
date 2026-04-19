import clsx from 'clsx';

export default function Card({ children, className }) {
    return (
        <div
            className={clsx(
                'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6',
                className
            )}
        >
            {children}
        </div>
    );
}