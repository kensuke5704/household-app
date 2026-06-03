import type { Metadata } from "next";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Household Boo",
  description: "PWA app",
  manifest: "/manifest.webmanifest",
  themeColor: "#6b4f2a", // household側は "#6b4f2a"
  appleWebApp: {
  capable: true,
  title: "Household Book", // household側は "Household Book"
  statusBarStyle: "default",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}
      <PwaRegister />
      </body>
    </html>
  );
}
