import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/lib/RegisterSW"; // Componente client-side para registrar o SW

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PocketFlow",
  description: "Gerencie seus gastos diários",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0074a6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="6wIovKF9M4CCO3WdIAvF7WLIn6z5i-cZrWuduCLKi9Q"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Componente client-side apenas para registrar SW */}
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
