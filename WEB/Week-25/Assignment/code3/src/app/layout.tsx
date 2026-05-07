import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Bus — Redis Pub/Sub",
  description: "Real-time domain events with Redis Pub/Sub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 min-h-screen font-sans antialiased text-white">
        {children}
      </body>
    </html>
  );
}
