import { createClient } from "@/lib/supabaseServer";
import { Typography, Breadcrumbs } from "@mui/material";
import ProductList from "@/components/client/ProductList";
import Link from "next/link";

export async function generateMetadata(props) {
  const params = await props.searchParams;

  const category = params?.categoria || null;
  const subcategory = params?.subcategoria || null;
  return {
    title: `${category ? category : "Todos los productos"} ${
      subcategory ? `| ${subcategory}` : ""
    }`,
  };
}
export default async function Products(props) {
  const params = await props.searchParams;

  const category = params?.categoria || null;
  const subcategory = params?.subcategoria || null;

  const supabase = await createClient();

  let query = supabase.from("products").select("*").eq("active", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (subcategory) {
    query = query.eq("subcategory", subcategory);
  }

  const { data: products } = await query;

  return (
    <main>
      <Typography
        component="h1"
        variant="h4"
        color="inherit"
        sx={{ mt: "2rem" }}
      >
        {subcategory ? subcategory : ""}
        {!subcategory && category ? category : ""}
        {!subcategory && !category ? "Todos los productos" : ""}
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: "2rem" }}>
        <Link href="/" passHref>
          <Typography color="inherit">Inicio</Typography>
        </Link>

        <Link href="/productos" passHref>
          <Typography color="inherit">Productos</Typography>
        </Link>

        {category && (
          <Link
            href={{
              pathname: "/productos",
              query: { categoria: category },
            }}
            passHref
          >
            <Typography color="inherit">{category}</Typography>
          </Link>
        )}

        {subcategory && (
          <Typography color="text.primary">{subcategory}</Typography>
        )}
      </Breadcrumbs>

      <ProductList products={products} />
    </main>
  );
}
