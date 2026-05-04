import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whiteboard — WebSockets",
  description: "Real-time collaborative whiteboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
