import clsx from 'clsx';

export default function Badge({ positive, children }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                positive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
            )}
        >
            {positive ? '▲' : '▼'} {children}
        </span>
    );
}