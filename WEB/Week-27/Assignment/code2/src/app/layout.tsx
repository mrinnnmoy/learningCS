import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Production Blog",
  description: "A production-ready Next.js 16 blog",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-slate-900 min-h-screen antialiased">
        <nav className="border-b border-slate-100 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <a href="/" className="font-bold text-slate-900">
              Production Blog
            </a>
            <a
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Admin →
            </a>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
