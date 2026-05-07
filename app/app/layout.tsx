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
  metadataBase: new URL("https://omilearn.com"),
  title: {
    default: "Omilearn - AI học tập, lộ trình học và ôn tập thông minh",
    template: "%s | Omilearn",
  },
  description:
    "Omilearn là nền tảng AI học tập giúp sinh viên tạo lộ trình học cá nhân hóa, hỏi đáp tài liệu, tạo quiz, flashcard, ghi chú và ôn tập thông minh.",
  keywords: [
    "Omilearn",
    "AI học tập",
    "trợ lý học tập AI",
    "AI study assistant",
    "tạo lộ trình học bằng AI",
    "AI quiz generator",
    "flashcard AI",
    "ghi chú học tập AI",
    "ôn tập thông minh",
    "nền tảng học tập Việt Nam",
  ],
  authors: [{ name: "Omilearn" }],
  creator: "Omilearn",
  publisher: "Omilearn",
  applicationName: "Omilearn",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://omilearn.com/",
    siteName: "Omilearn",
    title: "Omilearn - AI học tập cá nhân hóa cho sinh viên",
    description:
      "Tạo lộ trình học, hỏi đáp tài liệu, tạo quiz, flashcard và ghi chú thông minh bằng AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Omilearn - AI học tập cá nhân hóa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omilearn - AI học tập cá nhân hóa",
    description: "AI học tập giúp tạo lộ trình, quiz, flashcard, ghi chú và hỏi đáp tài liệu.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://omilearn.com/#organization",
                  name: "Omilearn",
                  url: "https://omilearn.com",
                  logo: "https://omilearn.com/favicon.ico",
                  sameAs: ["https://omilearn.com"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://omilearn.com/#website",
                  url: "https://omilearn.com",
                  name: "Omilearn",
                  description: "Nền tảng AI học tập cá nhân hóa cho sinh viên.",
                  inLanguage: "vi-VN",
                  publisher: { "@id": "https://omilearn.com/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://omilearn.com/blog?search={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://omilearn.com/#app",
                  name: "Omilearn",
                  applicationCategory: "EducationalApplication",
                  operatingSystem: "Web",
                  url: "https://omilearn.com",
                  description: "AI học tập giúp tạo lộ trình học, hỏi đáp tài liệu, tạo quiz, flashcard và ghi chú thông minh.",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
                },
              ],
            }),
          }}
        />
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