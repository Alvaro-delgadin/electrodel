"use client";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/app/stores/cartStore";
import { useRouter } from "next/navigation";

export default function ProductDetail({ selected, variants }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(selected.images?.[0]);
  const [color, setColor] = useState(selected?.color);
  const [watts, setWatts] = useState(selected?.watts);
  const [quantity, setQuantity] = useState("1");
  const { addToCart } = useCartStore();
  const cart = useCartStore((state) => state.cart);

  const filteredColors = [...new Set(variants.map((v) => v.color))];
  const filteredWatts = [...new Set(variants.map((v) => v.watts))];

  const selectedVariant = variants.find(
    (v) => v.color === color && v.watts === Number(watts)
  );

  const quantityInCart = cart
    .filter((item) => item.id === selectedVariant?.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const maxAvailable = selectedVariant
    ? selectedVariant.stock - quantityInCart
    : 0;
  const handleAddToCart = () => {
    if (!selectedVariant || quantity === "" || Number(quantity) < 1) return;
    addToCart({
      ...selectedVariant,
      quantity: Number(quantity),
      finalPrice: selectedVariant.price * Number(quantity),
    });
  };

  const handleBuyNow = () => {
    handleAddToCart(); // sigue agregando al carrito
    router.push("/pago"); // va a la página
  };

  const discount = selectedVariant?.discount || 0;
  const finalPrice = selectedVariant?.price
    ? selectedVariant.price * (1 - discount / 100)
    : 0;

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
      <Grid imd={6}>
        {/* Galería de imágenes
         */}
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
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt="Producto"
              width={300}
              height={300}
              priority
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          ) : null}
        </Box>

        {/* Selector de imágenes */}
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
                    ? "2px solid #1976d2"
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
                style={{ objectFit: "contain" }}
              />
            </Box>
          ))}
        </Box>
      </Grid>

      {/* Información del producto */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "20rem",
          width: "100%",
          gap: "0.5rem",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {selected.product}
        </Typography>

        {/* Precio */}
        {selectedVariant ? (
          <>
            <Typography component="h1" variant="h4">
              ${finalPrice}
            </Typography>
            {discount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Typography
                  sx={{
                    textDecoration: "line-through",
                    color: "#666666",
                    fontSize: "large",
                  }}
                >
                  ${selectedVariant.price}
                </Typography>
                <Box
                  sx={{
                    fontWeight: "bold",
                    color: "#f5f5f5",
                    width: "fit-content",
                    bgcolor: "#ec3237",
                    p: "0.5rem 1rem",
                    borderRadius: "1rem",
                  }}
                >
                  -{discount} % OFF
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="h6" color="error" sx={{ m: "0.7rem 0" }}>
            No hay stock para esta combinación de color y potencia.
          </Typography>
        )}

        {/* Categoría */}
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {selected.category} — {selected.subcategory}
        </Typography>

        {/* Selectores de variante */}
        <Box sx={{ mt: 3 }}>
          {/* Color */}
          <Typography variant="subtitle2">Color</Typography>
          <ToggleButtonGroup
            exclusive
            value={color}
            onChange={(_, newColor) => setColor(newColor)}
            sx={{ my: 1, flexWrap: "wrap", gap: 1 }}
          >
            {filteredColors.map((c) => (
              <ToggleButton key={c} value={c}>
                {c}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Potencia */}
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Potencia
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={watts}
            onChange={(_, newWatts) => setWatts(newWatts)}
            sx={{ my: 1, flexWrap: "wrap", gap: 1 }}
          >
            {filteredWatts.map((w) => (
              <ToggleButton key={w} value={w}>
                {w}W
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Cantidad */}
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            sx={{ mt: 2 }}
            fullWidth
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setQuantity("");
              } else {
                const num = Number(val);
                if (!isNaN(num) && num >= 1 && num <= maxAvailable) {
                  setQuantity(val);
                }
              }
            }}
            slotProps={{
              input: {
                min: 1,
                max: maxAvailable,
              },
            }}
          />
          {maxAvailable <= 0 && selectedVariant && (
            <Typography color="error">
              Ya agregaste todo el stock disponible al carrito.
            </Typography>
          )}

          {/* Botones */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: "1rem" }}>
            <Button
              variant="contained"
              fullWidth
              disabled={
                !selectedVariant ||
                Number(quantity) < 1 ||
                Number(quantity) > maxAvailable ||
                maxAvailable < 1
              }
              onClick={handleAddToCart}
            >
              Añadir al carrito
            </Button>
            <Button
              variant="outlined"
              fullWidth
              disabled={
                !selectedVariant ||
                Number(quantity) < 1 ||
                Number(quantity) > maxAvailable ||
                maxAvailable < 1
              }
              onClick={handleBuyNow}
            >
              Comprar ahora
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
