import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BitdefenderCleaner from "@/components/BitdefenderCleaner";
import ChatBotWrapper from "@/components/ChatBotWrapper";
import ErrorSuppressor from "@/components/ErrorSuppressor";
import DevErrorSuppressor from "@/components/error-boundaries/DevErrorSuppressor";
import TestCredentials from "@/components/dev/TestCredentials";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stealdeals - Discover Unbeatable Property Deals",
  description: "Find the best real estate deals on Stealdeals. Browse properties for sale and rent across the country.",
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: 'any',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      }
    ],
  },
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
        {/* Favicon links */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Add Boxicons for icons used in the admin panel */}
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
        {/* Temporarily disabled for performance */}
        {/* <BitdefenderCleaner /> */}
        {/* Handle browser extension errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('message channel closed')) {
                  e.preventDefault();
                  return false;
                }
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && 
                    e.reason.message.includes('message channel closed')) {
                  e.preventDefault();
                  return false;
                }
              });
            `
          }}
        />
      </head>
      <body
        className={`${jost.variable} antialiased`}
        suppressHydrationWarning
        {...customData}
      >
        {/* Temporarily disabled for performance */}
        {/* <ErrorSuppressor />
        <DevErrorSuppressor /> */}
        <Providers>{children}</Providers>
        <ChatBotWrapper />
        {/* <TestCredentials /> */}
      </body>
    </html>
  );
}
