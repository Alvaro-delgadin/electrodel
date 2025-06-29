"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import formatPrice from "@/lib/client/formatters/formatPrice";
import AddToCartForm from "./AddToCartForm";

export default function ProductCard({ productName, variants }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(false);
  const hasDiscount = variants.some((v) => v.discount > 0);

  return (
    <Card
      sx={{
        width: "16rem",
        bgcolor: "#f5f5f5",
        transition: "filter 0.3s ease",
        filter: "brightness(1)",
        "&:hover": {
          filter: "brightness(0.9) contrast(1.3)",
        },
      }}
      key={variants[0].id}
    >
      <Link
        href={`/producto/${variants[0].id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Box
          sx={{
            maxWidth: "15rem",
            width: "100%",
            aspectRatio: "1/1",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#fff",
            marginInline: "auto",
          }}
        >
          {variants[0]?.images?.[0] && (
            <Image
              height={200}
              width={200}
              src={variants[0].images[0]}
              alt={productName}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          )}
        </Box>

        <CardContent>
          <Typography variant="h6" component="div" noWrap>
            {productName}
          </Typography>
          <Typography variant="body2" color="secondary">
            {variants[0].category}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {variants.length > 1
              ? `Desde $${formatPrice(
                  Math.min(
                    ...variants.map((v) => v.price * (1 - v.discount / 100))
                  )
                )}`
              : `$${formatPrice(
                  variants[0].price * (1 - variants[0].discount / 100)
                )}`}
          </Typography>
          {hasDiscount && (
            <Box
              sx={{
                bgcolor: "#ec3237",
                borderRadius: "2rem",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: "bold",
                p: "0.5rem 0.8rem",
                position: "absolute",
                top: "0",
                left: "0",
              }}
            >
              Oferta
            </Box>
          )}
        </CardContent>
      </Link>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          onClick={handleClick}
          sx={{ padding: "0.5rem", gap: "0.5rem" }}
        >
          Agregar al carrito
          <ShoppingCart />
        </Button>
      </CardActions>
      <AddToCartForm
        mode="card"
        anchorEl={anchorEl}
        handleClose={handleClose}
        variants={variants}
        open={open}
      />
    </Card>
  );
}
