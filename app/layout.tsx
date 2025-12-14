import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientLayout } from "./ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exiled RP - Serveur Roleplay Cyberpunk",
  description: "Un RP cyberpunk réaliste, immersif, et communautaire.",
  verification: {
    google: "54406c9327f3d370",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Record<string, never>>;
}>) {
  // Déballer params même si non utilisé pour éviter l'erreur de sérialisation
  await params;
  return (
    <html
      lang="fr"
      className="bg-[#181A1B] text-white"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
