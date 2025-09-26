import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام إدارة السير الذاتية",
  description: "نظام شامل لإدارة السير الذاتية مع إمكانيات التعاون المباشر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-cairo antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
