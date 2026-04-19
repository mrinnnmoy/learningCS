import { cn } from '../../lib/cn';

export default function Skeleton({ className }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 rounded-md',
                className
            )}
        />
    );
}