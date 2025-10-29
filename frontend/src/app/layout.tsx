import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/WalletContext";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowFi - DeFi Automation & Subscription Platform",
  description: "Automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance on Flow blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        <WalletProvider>
          <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">FlowFi</Link>
              <div className="space-x-4">
                <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
                <Link href="/create-workflow" className="hover:text-blue-400">Create Workflow</Link>
                <Link href="/analytics" className="hover:text-blue-400">Analytics</Link>
                <Link href="/community" className="hover:text-blue-400">Community</Link>
                <Link href="/leaderboard" className="hover:text-blue-400">Leaderboard</Link>
                <Link href="/settings" className="hover:text-blue-400">Settings</Link>
                <Link href="/admin" className="hover:text-blue-400">Admin</Link>
              </div>
            </div>
          </nav>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
