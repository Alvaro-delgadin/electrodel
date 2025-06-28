"use client";
import {
  Box,
  Typography,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import formatPrice from "@/lib/client/formatters/formatPrice";
import { useRouter } from "next/navigation";
export default function ProductDetailMenu({
  handleAddToCart,
  hasColor,
  hasWatts,
  hasAmpere,
  filteredColors,
  filteredWatts,
  filteredAmperes,
  color,
  setColor,
  watts,
  setWatts,
  ampere,
  setAmpere,
  quantity,
  setQuantity,
  maxAvailable,
  selectedVariant,
  finalPrice,
  discount,
  priceWithDiscount,
  loading,
}) {
  const router = useRouter();
  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/pago");
  };
  return (
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
        {selectedVariant?.product}
      </Typography>

      {selectedVariant && !loading ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Typography component="h1" variant="h4">
            ${formatPrice(priceWithDiscount)}
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
                ${formatPrice(selectedVariant.price)}
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
        </Box>
      ) : (
        ""
      )}
      {!selectedVariant && !loading ? (
        <Typography variant="h6" color="error">
          No hay stock para esta combinación.
        </Typography>
      ) : (
        ""
      )}

      <Typography sx={{ mt: 1 }} color="text.secondary">
        {selectedVariant?.category} — {selectedVariant?.subcategory}
      </Typography>

      {selectedVariant?.brand ? (
        <Typography color="text.secondary">
          Marca: {selectedVariant.brand}
        </Typography>
      ) : (
        ""
      )}
      {selectedVariant?.description ? (
        <>
          <Typography component="p" variant="body" sx={{ mt: 1 }}>
            Descripción:
          </Typography>
          <Typography color="text.secondary">
            {selectedVariant.description}
          </Typography>
        </>
      ) : (
        ""
      )}
      <Box sx={{ mt: 3 }}>
        {hasColor && (
          <>
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
          </>
        )}

        {hasWatts && (
          <>
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
          </>
        )}

        {hasAmpere && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Corriente (A)
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={ampere}
              onChange={(_, newAmpere) => setAmpere(newAmpere)}
              sx={{ my: 1, flexWrap: "wrap", gap: 1 }}
            >
              {filteredAmperes.map((a) => (
                <ToggleButton key={a} value={a}>
                  {a}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </>
        )}
        <Typography
          component="p"
          sx={{ fontSize: "1rem", fontWeight: "bold", mt: "1rem" }}
        >
          Total: ${formatPrice(finalPrice)}
        </Typography>
        {/* Cantidad */}
        <TextField
          label="Cantidad"
          type="number"
          value={quantity}
          sx={{ mt: 2 }}
          fullWidth
          onChange={(e) => {
            const val = e.target.value;
            const num = Number(val);
            if (val === "") {
              setQuantity("");
            } else if (!isNaN(num) && num >= 1 && num <= maxAvailable) {
              setQuantity(val);
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
              maxAvailable < 1 ||
              (hasColor && !color) ||
              (hasWatts && !watts)
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
              maxAvailable < 1 ||
              (hasColor && !color) ||
              (hasWatts && !watts)
            }
            onClick={handleBuyNow}
          >
            Comprar ahora
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
