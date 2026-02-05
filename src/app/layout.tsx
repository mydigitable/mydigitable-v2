import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyDigitable | El menú digital que tu restaurante merece",
  description: "Digitaliza tu restaurante en minutos. Menú online, pedidos y pagos sin complicaciones. Usado por +500 restaurantes en España.",
  keywords: ["menú digital", "restaurante", "QR code", "pedidos online", "España"],
  openGraph: {
    title: "MyDigitable | El menú digital que tu restaurante merece",
    description: "Digitaliza tu restaurante en minutos. Sin complicaciones.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
