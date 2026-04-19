import { cn } from '../../lib/cn';

const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}) {
    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variantClasses[variant],
                sizeClasses[size],
                className // passed last so consumer overrides always win via twMerge
            )}
            {...props}
        >
            {children}
        </button>
    );
}