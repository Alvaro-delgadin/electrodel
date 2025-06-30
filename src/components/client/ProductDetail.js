"use client";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import AddToCartForm from "./AddToCartForm";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function ProductDetail({ selected, variants }) {
  const [selectedImage, setSelectedImage] = useState(selected?.images?.[0]);
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        padding: "1rem 0",
        width: "100%",
        gap: "2rem",
      }}
    >
      <Grid>
        {/* Galería */}
        <Zoom>
          <Box
            sx={{
              maxWidth: "20rem",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
              border: "1px #666666 solid",
            }}
          >
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Producto"
                width={300}
                height={300}
                priority
                unoptimized
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            )}
          </Box>
        </Zoom>

        {/* Selector miniaturas */}
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          {selected.images?.map((img, i) => (
            <Box
              key={i}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 1,
                overflow: "hidden",
                border:
                  selectedImage === img
                    ? "2px solid #ec3237"
                    : "1px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt="Mini"
                width={64}
                height={64}
                priority
                unoptimized
                style={{ objectFit: "contain" }}
              />
            </Box>
          ))}
        </Box>
      </Grid>
      {/* Información del producto */}
      <AddToCartForm selected={selected} variants={variants} mode="detail" />
    </Box>
  );
}
