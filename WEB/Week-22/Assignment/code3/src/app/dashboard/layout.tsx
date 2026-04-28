import Link from "next/link";

const sidebarLinks = [
  { href: "/dashboard", label: "📊 Overview" },
  { href: "/dashboard/cart", label: "🛒 Cart" },
  { href: "/dashboard/orders", label: "📦 Orders" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 min-h-[70vh]">
      <aside className="w-52 flex-shrink-0">
        <nav className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
