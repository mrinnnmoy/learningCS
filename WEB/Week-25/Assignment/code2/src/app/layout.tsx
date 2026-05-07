import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Pipeline — BullMQ",
  description: "Job pipeline with fan-out, priority, DLQ, and SSE",
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
