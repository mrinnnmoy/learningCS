import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Web — Turborepo Demo",
  description: "A Next.js app in a Turborepo monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
