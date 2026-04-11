import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Graphic Stuff Archive",
  description: "A graphic design archive presented like a studio cutting mat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
