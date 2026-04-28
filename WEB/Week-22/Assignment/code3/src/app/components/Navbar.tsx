"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex items-center gap-8">
      <span className="font-bold text-lg text-blue-400">NextStore</span>
      <div className="flex gap-6 flex-1">
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
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white text-sm"
            >
              {session.user?.name}
            </Link>
            <Link
              href="/dashboard/cart"
              className="text-slate-300 hover:text-white text-sm"
            >
              🛒 Cart
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-slate-300 hover:text-white text-sm"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
