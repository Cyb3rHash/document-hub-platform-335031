import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocumentHub — Secure document sharing and viewing",
  description:
    "Upload, manage, and share documents with fine-grained access controls, analytics, and a fast, modern viewer experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
