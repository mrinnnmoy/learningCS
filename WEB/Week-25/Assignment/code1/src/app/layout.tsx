import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queue Dashboard — BullMQ",
  description: "Background job queues with BullMQ and Redis",
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
