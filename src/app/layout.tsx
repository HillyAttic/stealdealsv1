import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BitdefenderCleaner from "@/components/BitdefenderCleaner";
import ChatBotWrapper from "@/components/ChatBotWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stealdeals - Discover Unbeatable Property Deals",
  description: "Find the best real estate deals on Stealdeals. Browse properties for sale and rent across the country.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: true,
};

// This variable helps silence React hydration warnings
// It's used to indicate to React that hydration differences are expected
const customData = {
  'data-custom-lib': 'next-root',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Add Boxicons for icons used in the admin panel */}
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
        {/* Add BitdefenderCleaner to clean extension attributes early */}
        <BitdefenderCleaner />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
        {...customData}
      >
        <Providers>{children}</Providers>
        <ChatBotWrapper />
      </body>
    </html>
  );
}
