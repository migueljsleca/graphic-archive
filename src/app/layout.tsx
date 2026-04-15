import type { Metadata } from "next";
import {
  Bitcount_Grid_Double,
  Bitcount_Grid_Single,
} from "next/font/google";

import "./globals.css";

const bitcountGridDouble = Bitcount_Grid_Double({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-bitcount-grid-double",
  axes: ["slnt", "CRSV", "ELSH", "ELXP"],
});

const bitcountGridSingle = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-bitcount-grid-single",
  axes: ["slnt", "CRSV", "ELSH", "ELXP"],
});

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
    <html
      lang="en"
      className={`h-full antialiased ${bitcountGridDouble.variable} ${bitcountGridSingle.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
