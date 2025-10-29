import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FlowFi - DeFi Automation & Subscription Platform",
  description: "Automate DeFi actions, recurring payments, staking, and workflows on Flow Blockchain",
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
      </body>
    </html>
  );
}
