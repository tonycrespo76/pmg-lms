import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PMG Learning",
  description: "Partners Merchant Group training academy",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
