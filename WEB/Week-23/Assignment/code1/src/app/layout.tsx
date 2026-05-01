import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Manager — tRPC",
  description: "Type-safe task management with tRPC and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
