import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header.js";

export const metadata = {
  title: "Tienda Online de Electricidad e Iluminación | Eletrodel",
  description:
    "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Eletrodel encontrás calidad, buenos precios y atención personalizada.",
};
const inter = Inter({
  subsets: ["latin"], // Podés ajustar esto según el idioma que uses
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
