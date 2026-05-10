import type { Metadata } from "next";
import { ToastProvider } from '@/components/ui/ToastContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeBase — KBO 티켓 이상 거래 탐지",
  description: "KBO 리그의 암표(티켓 스캘핑) 문제를 해결하기 위한 AI 기반 티켓 이상 거래 탐지 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
