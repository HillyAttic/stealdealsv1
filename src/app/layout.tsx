import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
// Cobalt design tokens + components; every selector is scoped under
// [data-theme="cobalt"] / .cobalt-page, so it is inert until a page opts in.
import "./admin/cobalt.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import ChatBotWrapper from "@/components/ChatBotWrapper";
import StickyCtaBar from "@/components/StickyCtaBar";
import { LeadMirror } from "@/components/LeadMirror";
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';

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
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '686919238817912');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=686919238817912&ev=PageView&noscript=1"
            />
          </noscript>
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
          <LeadMirror />
          <ChatBotWrapper />
          <StickyCtaBar />
          <Script id="tawk-to" strategy="lazyOnload">
            {`
              if (!location.pathname.startsWith('/admin')) {
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/6abcc9063b7d273440456c12/1k3on2h5d';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              }
            `}
          </Script>
        </body>
      </html>
    </AuthProvider>
  );
}
