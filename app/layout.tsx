import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeno Store | Modern Watches",
  description: "A modern mobile-first watch store."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
