import type { Metadata } from "next";
import "./globals.css";
import "./auth.css";
import "./extra.css";

export const metadata: Metadata = {
  title: "MyRealProduct Training",
  description: "A personalised AI engineering training workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
