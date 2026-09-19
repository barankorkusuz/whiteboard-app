import { Inter } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode}) {
  return (
    <html
      lang="en"
    >
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
