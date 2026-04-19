import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combines clsx (conditional class logic) with tailwind-merge
// (resolves conflicting Tailwind classes — e.g. 'bg-blue-500 bg-red-500'
// would keep both with plain clsx, but twMerge correctly keeps only the last one).
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}