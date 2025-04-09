import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "관리자 대시보드",
  description: "Next.js와 Tailwind CSS로 만든 관리자 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
