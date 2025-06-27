import { createClient } from "@/lib/supabaseServer"; // adaptalo a tu config
import ProductDetail from "@/components/client/ProductDetail";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: selected, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

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

  return (
    <main>
      <ProductDetail selected={selected} variants={variants} />
    </main>
  );
}
