import type { Metadata } from "next";
import {
  Poppins,
  Inter,
  Playfair_Display,
  Bebas_Neue,
  Lato,
  Lora,
  DM_Sans,
  Outfit,
  Libre_Baskerville,
  Barlow,
  Source_Sans_3,
  Cormorant_Garamond
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "sonner";

// PRIMARY FONT - Poppins
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

// Theme Fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

// Legacy fonts (keep for compatibility)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=Quicksand:wght@400;600;700&family=Bebas+Neue&family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@400;700&family=Barlow:wght@400;600;700&family=Outfit:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Crimson+Text:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.variable} ${dmSans.variable} ${playfair.variable} ${bebas.variable} ${outfit.variable} ${libreBaskerville.variable} ${barlow.variable} ${sourceSans.variable} ${cormorant.variable} ${lato.variable} ${inter.variable} ${lora.variable} font-poppins`}>
        <ToastProvider>
          {children}
        </ToastProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
