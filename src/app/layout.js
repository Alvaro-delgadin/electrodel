import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header.js";

export const metadata = {
  title: "Tienda Online de Electricidad e Iluminación | Electrodel",
  description:
    "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Tienda Online de Electricidad e Iluminación | Electrodel",
    description:
      "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
    url: "https://eletrodel.com.ar",
    siteName: "Eletrodel",
    images: [
      {
        url: "https://eletrodel.com.ar/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Logo de Eletrodel",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda Online de Electricidad e Iluminación | Electrodel",
    description:
      "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
    images: ["https://eletrodel.com.ar/logo.jpg"],
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter}>
        <Header />
        {children}
      </body>
    </html>
  );
}
