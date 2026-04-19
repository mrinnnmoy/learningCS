import clsx from 'clsx';

const navItems = [
    { label: 'Dashboard', icon: '📊', active: true },
    { label: 'Orders', icon: '🛒', active: false },
    { label: 'Customers', icon: '👥', active: false },
    { label: 'Settings', icon: '⚙️', active: false },
];

export default function Sidebar({ open }) {
    return (
        <aside
            className={clsx(
                'bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 w-64 flex-shrink-0',
                'fixed md:static inset-y-0 left-0 z-40 transition-transform duration-200',
                open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}
        >
            <div className="h-16 flex items-center px-6 font-bold text-xl text-brand-600 dark:text-brand-400">
                Brandly
            </div>
            <nav className="px-3 space-y-1">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href="#"
                        className={clsx(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            item.active
                                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </a>
                ))}
            </nav>
        </aside>
    );
}