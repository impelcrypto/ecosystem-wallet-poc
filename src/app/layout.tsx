import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/modules/common/header/Header";
import { ThirdwebSdkProviders } from "@/modules/thirdweb/components/ThirdwebSdkProviders/ThirdwebSdkProviders";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ecosystem wallet demo",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Memo: Adding ThirdwebProvider makes the app slow in reflecting the changes */}
        <ThirdwebSdkProviders>
          <Toaster position="top-right" reverseOrder={false} />
          <Header />
          <div>{children}</div>
        </ThirdwebSdkProviders>
      </body>
    </html>
  );
}
