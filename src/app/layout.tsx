import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Aimatch - AI 驱动的社交匹配平台",
  description: "让 AI Agent 帮你找到志同道合的朋友",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={notoSans.className}>
        {children}
      </body>
    </html>
  );
}
// Force rebuild: 2026年 4月 9日 星期四 10时46分38秒 CST
