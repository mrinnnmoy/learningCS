import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat — Socket.IO",
  description: "Real-time chat with Socket.IO and Next.js 16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
