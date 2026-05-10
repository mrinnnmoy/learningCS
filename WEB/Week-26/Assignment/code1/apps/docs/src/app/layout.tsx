import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Docs — Turborepo Demo",
  description: "Documentation site in a Turborepo monorepo",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
