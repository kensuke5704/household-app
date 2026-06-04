import type { Metadata } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Household App",
  description: "Household management app",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Household App",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Household App",
  description: "Household management app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.png",
    apple: "/icons/icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Household App",
    statusBarStyle: "default",
  },
};