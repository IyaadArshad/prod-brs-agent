import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BRS Agent - ChatGPT",
  description: "A ChatGPT-powered assistant for BRS.",
  keywords: "ChatGPT, BRS, AI Assistant, Productivity",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full"> {/* Ensure html has full height */}
      <head>
        {/* Add meta tags for SEO and accessibility */}
        <meta charSet="UTF-8" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-black overflow-hidden`} /* Added h-full and overflow-hidden */
      >
        {children}
      </body>
    </html>
  );
}