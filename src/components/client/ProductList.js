import { Typography, Box } from "@mui/material";
import { Inventory2Outlined } from "@mui/icons-material";
import ProductCard from "./ProductCard";

export default function ProductList({ products }) {
  const groupedProducts = Object.values(
    products.reduce((acc, product) => {
      const key = product.product;
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {})
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: "2rem",
      }}
    >
      {groupedProducts?.length ? (
        groupedProducts?.map((variants) => (
          <ProductCard
            key={variants[0].id}
            productName={variants[0].product}
            variants={variants}
          />
        ))
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={6}
          color="text.secondary"
        >
          <Inventory2Outlined sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">No se encontraron productos</Typography>
          <Typography variant="body2">
            Probá con otra categoría o buscá algo diferente.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
