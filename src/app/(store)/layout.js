import "@/styles/client/globals.css";
import Header from "@/components/client/Header.js";
import Footer from "@/components/client/Footer";
import ThemeRegistry from "@/components/client/ThemeRegistry";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { createClient } from "@/lib/supabaseServer";
import WhatsApp from "@/components/client/Whatsapp";
import Banner from "@/components/client/Banner";
import BannerImage from "@/components/client/BannerImage";
import LocationSelector from "@/components/client/LocationSelector";
import ClarityTracker from "@/components/client/ClaritytTacker";
export const metadata = {
  title: "Electricidad e Iluminación | Electrodel",
  description:
    "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Electricidad e Iluminación | Electrodel",
    description:
      "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
    url: "https://electrodel.com.ar",
    siteName: "Electrodel",
    images: [
      {
        url: "https://electrodel.com.ar/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Logo de Electrodel",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electricidad e Iluminación | Electrodel",
    description:
      "Descubrí productos de electricidad e iluminación para tu hogar o negocio. En Electrodel encontrás calidad, buenos precios y atención personalizada.",
    images: ["https://electrodel.com.ar/logo.jpg"],
  },
};

export default async function ClientLayout({ children }) {
  const supabase = await createClient();
  const settings = await supabase.from("settings").select("*").single();
  const brand = settings?.data;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true);

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("active", true)
    .order("name", { ascending: true });

  return (
    <AppRouterCacheProvider>
      <ThemeRegistry>
        <ClarityTracker />
        <Header logo={brand?.logo} products={products} />
        <LocationSelector locations={locations || []} />
        {brand?.banner?.active ? (
          <Banner message={brand?.banner?.message} />
        ) : (
          ""
        )}
        {brand?.banner_image?.active ? (
          <BannerImage images={brand?.banner_image?.images} />
        ) : (
          ""
        )}
        {children}
        <WhatsApp whatsapp={brand?.whatsapp} />
        <Footer
          logo={brand?.logo}
          location={brand?.location}
          schedule={brand?.schedule}
        />
      </ThemeRegistry>
    </AppRouterCacheProvider>
  );
}
