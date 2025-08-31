import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BitdefenderCleaner from "@/components/BitdefenderCleaner";
import ChatBotWrapper from "@/components/ChatBotWrapper";
import ErrorSuppressor from "@/components/ErrorSuppressor";
import DevErrorSuppressor from "@/components/error-boundaries/DevErrorSuppressor";
import TestCredentials from "@/components/dev/TestCredentials";
import { ClerkProvider } from '@clerk/nextjs';
import { GoogleTagManager } from '@next/third-parties/google';

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stealdeals - Discover Unbeatable Property Deals",
  description: "Find the best real estate deals on Stealdeals. Browse properties for sale and rent across the country.",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <GoogleTagManager gtmId="GTM-KSJF5RQ8" />
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          
          {/* Favicon - Multiple formats for maximum compatibility */}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-71EPMH0ZW9"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-71EPMH0ZW9');
              `
            }}
          />
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
    </ClerkProvider>
  );
}
