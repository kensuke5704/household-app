import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家計簿アプリ",
  description: "Excel家計簿をもとにしたNext.js + Supabase家計簿アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
