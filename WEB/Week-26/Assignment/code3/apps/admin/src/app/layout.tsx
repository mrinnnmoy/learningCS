import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Admin",
  description: "Admin panel — apps/admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen font-sans antialiased">
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-bold text-white">Acme Admin</span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
              @acme/admin — port 3001
            </span>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
