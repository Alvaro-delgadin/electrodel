import { createClient } from "@/lib/supabaseServer";
import { Typography } from "@mui/material";
import ProductList from "@/components/client/ProductList";
export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false });

  return (
    <main>
      <Typography
        component="h1"
        sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, m: "2rem 0" }}
      >
        Productos destacados
      </Typography>
      <ProductList products={products} />
    </main>
  );
}
