"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex items-center gap-8">
      <span className="font-bold text-lg text-blue-400">NextShop</span>
      <div className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-blue-400 font-semibold"
                : "text-slate-300 hover:text-white transition-colors"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
