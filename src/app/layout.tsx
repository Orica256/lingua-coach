import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LinguaCoach — AIパーソナル英会話コーチ",
  description:
    "Claude AI が文法・表現を添削し、レベル判定から進捗分析までサポートする個人学習用の英会話Webアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={cn("dark font-sans", geistSans.variable)}
      suppressHydrationWarning
    >
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
