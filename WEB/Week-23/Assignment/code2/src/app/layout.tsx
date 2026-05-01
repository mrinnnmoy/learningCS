import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { TRPCProvider } from "@/lib/trpc/provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tRPC Blog",
  description: "tRPC Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <nav className="bg-slate-900 text-white px-6 py-4 flex items-center gap-6">
            <Link href="/" className="font-bold text-blue-400">
              tRPC Blog
            </Link>
            <a
              href="/dashboard"
              className="text-slate-300 hover:text-white text-sm"
            >
              Dashboard
            </a>
            <a
              href="/posts/new"
              className="text-slate-300 hover:text-white text-sm"
            >
              New Post
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
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Register
              </a>
            </div>
          </nav>
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
