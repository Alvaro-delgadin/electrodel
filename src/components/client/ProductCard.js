"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Menu,
  Select,
  TextField,
  InputLabel,
  FormControl,
  MenuItem,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { useCartStore } from "@/app/stores/cartStore";

export default function ProductCard({ productName, variants }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [color, setColor] = useState("");
  const [power, setPower] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const open = Boolean(anchorEl);
  const { addToCart } = useCartStore.getState();
  const cart = useCartStore((state) => state.cart);
  const quantityInCart = cart
    .filter((item) => item.id === selectedVariant?.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const maxAvailable = selectedVariant
    ? selectedVariant.stock - quantityInCart
    : 0;

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Potencias disponibles según color
  const filteredWatts = [
    ...new Set(
      variants.filter((v) => !color || v.color === color).map((v) => v.watts)
    ),
  ];

  // Colores disponibles según potencia (bidireccional)
  const filteredColors = [
    ...new Set(
      variants
        .filter((v) => !power || v.watts === Number(power))
        .map((v) => v.color)
    ),
  ];

  const handleReset = () => {
    setColor("");
    setPower("");
    setQuantity("");
    setSelectedVariant(null);
  };
  // Actualizar selectedVariant
  useEffect(() => {
    const variant = variants.find(
      (v) => v.color === color && v.watts === Number(power)
    );
    setSelectedVariant(variant || null);
  }, [color, power, variants]);

  // Limpiar potencia si ya no es válida
  useEffect(() => {
    if (power && !filteredWatts.includes(Number(power))) {
      setPower("");
    }
  }, [color]);

  // Precio calculado
  const price = selectedVariant?.price || 0;
  const finalPrice =
    quantity && !isNaN(quantity) && !isNaN(selectedVariant?.discount)
      ? price * (1 - selectedVariant?.discount / 100) * Number(quantity)
      : 0;

  const handleAddToCart = () => {
    if (selectedVariant && Number(quantity) > 0) {
      const item = {
        ...selectedVariant,
        quantity: Number(quantity),
        finalPrice,
      };
      addToCart(item);
      handleClose();
      setQuantity("1");
    }
  };

  return (
    <Card
      sx={{
        width: "18rem",
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
        {variants[0]?.images?.[0] ? (
          <Box
            sx={{
              maxWidth: "16rem",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: 2,
              overflow: "hidden",
              marginInline: "auto",
            }}
          >
            <Image
              height={200}
              width={200}
              src={variants[0].images[0]}
              alt={productName}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              maxWidth: "16rem",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: 2,
              overflow: "hidden",
              marginInline: "auto",
            }}
          ></Box>
        )}

        <CardContent>
          <Typography variant="h6" component="div" noWrap>
            {productName}
          </Typography>
          <Typography variant="body2" color="secondary">
            {variants[0].category}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {variants.length > 1
              ? `Desde $${Math.min(
                  ...variants.map((v) => v.price * (1 - v.discount / 100))
                )}`
              : `$${(
                  variants[0].price *
                  (1 - variants[0].discount / 100)
                ).toFixed(2)}`}
          </Typography>
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

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box
            sx={{
              p: 2,
              width: 250,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                label="Color"
              >
                {filteredColors.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Potencia</InputLabel>
              <Select
                value={power}
                onChange={(e) => setPower(e.target.value)}
                label="Potencia"
              >
                {filteredWatts.map((w) => (
                  <MenuItem key={w} value={w}>
                    {w}W
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Cantidad"
              type="number"
              value={quantity}
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
              fullWidth
            />

            <Typography variant="subtitle1">
              Precio final: ${finalPrice.toFixed(2)}
            </Typography>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleReset}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                Number(quantity) < 1 ||
                Number(quantity) > maxAvailable ||
                maxAvailable < 1
              }
            >
              Confirmar
            </Button>
            {maxAvailable <= 0 && selectedVariant && (
              <Typography color="error">
                Ya agregaste todo el stock disponible al carrito.
              </Typography>
            )}
          </Box>
        </Menu>
      </CardActions>
    </Card>
  );
}
