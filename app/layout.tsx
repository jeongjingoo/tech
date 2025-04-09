import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || 'd1ce32415b1038008e9c94dee00914bc';
  
  return (
    <html lang="ko" className="h-full">
      <head>
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
