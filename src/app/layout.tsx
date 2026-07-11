import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {

  title: {

    default: "KENAI CRM",

    template: "%s | KENAI CRM",

  },

  description: "Sistema de Gestão • Pantoja Phone Imports",

  applicationName: "KENAI CRM",

  authors: [

    {

      name: "Pantoja Phone Imports",

    },

  ],

  keywords: [

    "CRM",

    "Financeiro",

    "Parcelas",

    "Clientes",

    "Pantoja",

    "Celulares",

  ],

  icons: {

    icon: "/favicon.ico",

    shortcut: "/favicon.ico",

    apple: "/apple-touch-icon.png",

  },

  manifest: "/manifest.json",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >

      <body className="bg-zinc-950 text-white antialiased">

        <AuthProvider>

          {children}

        </AuthProvider>

      </body>

    </html>

  );

}