import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmi";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | AI Agent Dashboard`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = headers().get("cookie");
  const initialWagmiState = cookieToInitialState(wagmiConfig, cookie ?? undefined);

  return (
    <html lang="en" className={cn("dark", inter.variable)} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-grid">
        <Providers initialState={initialWagmiState}>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
