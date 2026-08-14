import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import ChatBotWrapper from "@/components/ChatBotWrapper";
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

const customData = {
  'data-custom-lib': 'next-root',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <GoogleTagManager gtmId="GTM-KSJF5RQ8" />
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="shortcut" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
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
          <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
          <script
            dangerouslySetInnerHTML={{
              __html: `
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
          <Providers>{children}</Providers>
          <ChatBotWrapper />
        </body>
      </html>
    </AuthProvider>
  );
}
