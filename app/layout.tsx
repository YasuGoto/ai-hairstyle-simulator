import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "髪型AIシミュレーター",
  description: "自分の写真と参考画像から髪型をAI変換するMVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
