import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
// 確保 polyfill 在應用啟動時載入
import "@/lib/polyfill";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeyPairDrop - Secure P2P File Sharing",
  description: "Share files securely and directly between devices using WebRTC. End-to-end encrypted, no server storage.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "KeyPairDrop - Secure P2P File Sharing",
    description: "Share files securely and directly between devices using WebRTC. End-to-end encrypted, no server storage.",
    url: "https://keypairdrop.vercel.app",
    siteName: "KeyPairDrop",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "KeyPairDrop Logo",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyPairDrop - Secure P2P File Sharing",
    description: "Share files securely and directly between devices using WebRTC.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
      </body>
    </html>
  );
}
