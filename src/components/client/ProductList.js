"use client";
import { Typography, Box, Pagination } from "@mui/material";
import { Inventory2Outlined } from "@mui/icons-material";
import ProductCard from "./ProductCard";
import { useState } from "react";

export default function ProductList({ products }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(products.length / PAGE_SIZE);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const pagitatedProducts = products.slice(from, to);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {pagitatedProducts?.length ? (
          pagitatedProducts?.map((variants) => (
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
      {totalPages > 1 && (
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2 }}
          size="large"
        />
      )}
    </Box>
  );
}
