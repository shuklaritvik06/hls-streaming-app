import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {ReactNode} from "react";
import {Toaster} from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HLS Streaming App | Ritvik Shukla",
  description: "A robust application for seamless HLS (HTTP Live Streaming) playback and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Toaster/>
        {children}
      </body>
    </html>
  );
}
