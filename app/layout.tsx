import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Household App",
  description: "Household management app",
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon.png`,
  },
  appleWebApp: {
    capable: true,
    title: "Household App",
    statusBarStyle: "default",
  },
};
