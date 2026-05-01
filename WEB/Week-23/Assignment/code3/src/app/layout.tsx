import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextStore — tRPC",
  description: "Type-safe e-commerce with tRPC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <TRPCProvider>
          <nav className="bg-slate-900 text-white px-6 py-4 flex items-center gap-6">
            <Link href="/" className="font-bold text-blue-400">
              NextStore
            </Link>
            <a href="/cart" className="text-slate-300 hover:text-white text-sm">
              🛒 Cart
            </a>
            <a
              href="/orders"
              className="text-slate-300 hover:text-white text-sm"
            >
              Orders
            </a>
            <div className="ml-auto flex gap-4">
              <a
                href="/login"
                className="text-slate-300 hover:text-white text-sm"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm"
              >
                Register
              </a>
            </div>
          </nav>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
