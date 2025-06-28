import { createClient } from "@/lib/supabaseServer"; // adaptalo a tu config
import ProductDetail from "@/components/client/ProductDetail";
import { cache } from "react";
export const fetchProduct = cache(async (id) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return { data, error };
});
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await fetchProduct(id);

  return {
    title: data?.product,
    description: data?.description,
    openGraph: {
      title: data?.product,
      description: data?.description,
      images: data?.images,
    },
  };
}
export default async function ProductPage({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: selected, error } = await fetchProduct(id);
  if (error || !selected)
    return (
      <main>
        <div>Producto no encontrado</div>
      </main>
    );

  const { data: variants } = await supabase
    .from("products")
    .select("*")
    .ilike("product", selected.product)
    .eq("active", true);

  // JSON-LD con schema.org/Product y Offer
  // Extraemos valores únicos para cada propiedad en todas las variantes
  const uniqueValues = (key) => {
    const values = variants
      .map((v) => v[key])
      .filter((val) => val !== undefined && val !== null);
    return [...new Set(values)];
  };

  const additionalProperties = [];

  const wattsValues = uniqueValues("watts");
  if (wattsValues.length)
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Potencia",
      value: wattsValues.join(", "),
    });

  const colorValues = uniqueValues("color");
  if (colorValues.length)
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Color",
      value: colorValues.join(", "),
    });

  const ampereValues = uniqueValues("ampere");
  if (ampereValues.length)
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Corriente",
      value: ampereValues.join(", "),
    });

  // Ahora armamos el JSON-LD final incluyendo additionalProperty
  const availability = selected.stock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: selected.product,
    image: selected.images,
    description: selected.description || selected.product,
    sku: selected.sku || selected.id,
    brand: {
      "@type": "Brand",
      name: selected.brand || "Marca desconocida",
    },
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: "ARS",
      price: selected.price.toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: additionalProperties,
  };
  return (
    <main>
      <ProductDetail selected={selected} variants={variants} />
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
