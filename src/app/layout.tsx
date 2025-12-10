import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/polyfill";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeyPairDrop",
  description: "Secure P2P File Drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-zinc-950 text-zinc-50 min-h-screen selection:bg-cyan-500/30"
        )}
      >
        {children}
      </body>
    </html>
  );
}
