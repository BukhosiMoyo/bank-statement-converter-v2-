import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Bank Statement Converter",
    template: "%s | Bank Statement Converter",
  },
  description:
    "Convert bank statement PDFs into clean CSV and XLSX working files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(26,132,110,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(205,165,104,0.24),transparent_36%),linear-gradient(180deg,#fbf4e9_0%,#f3ebdf_48%,#f8f2e8_100%)]" />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
