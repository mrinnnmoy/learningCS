import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Call — WebRTC",
  description: "P2P video calls with WebRTC and Socket.IO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
