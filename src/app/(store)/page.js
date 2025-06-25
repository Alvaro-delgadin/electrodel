import { createClient } from "@/lib/supabaseServer";
import { Typography } from "@mui/material";
import ProductList from "@/components/client/ProductList";

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true);

  return (
    <main>
      <Typography component="h1" variant="h4">
        Productos destacados
      </Typography>
      <ProductList products={products} />
    </main>
  );
}
