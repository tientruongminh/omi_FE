import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import AuthHydrator from "@/shared/ui/AuthHydrator";
import UserActivityTracker from "@/shared/ui/UserActivityTracker";
import FeedbackWidget from "@/shared/ui/FeedbackWidget";
import TokenBalanceBadge from "@/shared/ui/TokenBalanceBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omilearn — Nền tảng học tập thông minh",
  description: "Nền tảng giáo dục Việt Nam với mindmap tương tác và AI hỗ trợ",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F0EB] min-h-screen flex flex-col`}
      >
        <AuthHydrator />
        <UserActivityTracker />
        {children}
        <TokenBalanceBadge />
        <FeedbackWidget />
      </body>
    </html>
  );
}

// Note: The above code is the main layout for the frontend application. It sets up global styles, fonts, and includes an AuthHydrator component to manage authentication state across the app. The metadata object defines the page title and description for SEO purposes.