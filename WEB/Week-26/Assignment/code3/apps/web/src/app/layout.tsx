import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Shop",
  description: "Customer-facing storefront — apps/web",
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen font-sans antialiased">
        <nav className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-bold text-slate-900">Acme Shop</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              @acme/web — port 3000
            </span>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
