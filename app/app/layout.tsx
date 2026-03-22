import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "@/components/TopNavBar";
import Footer from "@/components/Footer";

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
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F0EB] min-h-screen flex flex-col`}
      >
        <TopNavBar />
        <main className="flex-1 pt-[78px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
