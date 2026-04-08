import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import AuthHydrator from "@/shared/ui/AuthHydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmiLearn — Editorial Learning Platform",
  description: "A Vietnamese education platform with interactive mindmaps",
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
        {children}
      </body>
    </html>
  );
}

// Note: The above code is the main layout for the frontend application. It sets up global styles, fonts, and includes an AuthHydrator component to manage authentication state across the app. The metadata object defines the page title and description for SEO purposes.