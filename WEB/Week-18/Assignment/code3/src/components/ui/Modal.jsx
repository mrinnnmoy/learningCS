import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

export default function Modal({ isOpen, onClose, title, children }) {
    // Track a separate "rendered" state so we can animate the exit transition
    // before fully unmounting — closing isOpen alone would remove it instantly.
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0'
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                onTransitionEnd={handleAnimationEnd}
                className={cn(
                    'relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transition-all duration-200',
                    isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}