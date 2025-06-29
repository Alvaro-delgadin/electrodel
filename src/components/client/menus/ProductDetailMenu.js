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
  getFilteredOptions,
  getSelectedValue,
  setSelectedValue,
  attributesToShow,
  isDisabled,
  labelMap,
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
        {attributesToShow.map((attr) => {
          const options = getFilteredOptions(attr);
          if (options.length === 0) return null;

          const sortedOptions = [...options].sort((a, b) =>
            typeof a === "number" ? a - b : a.localeCompare(b)
          );

          return (
            <Box key={attr} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                {labelMap[attr] || attr}
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={getSelectedValue(attr)}
                onChange={(_, newValue) => setSelectedValue(attr, newValue)}
                sx={{ my: 1, flexWrap: "wrap", gap: 1 }}
              >
                {sortedOptions.map((opt) => (
                  <ToggleButton key={`${attr}-${opt}`} value={opt}>
                    {attr === "watts"
                      ? `${opt}W`
                      : attr === "ampere"
                      ? `${opt}`
                      : attr === "voltage"
                      ? `${opt}`
                      : opt}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          );
        })}

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
            disabled={isDisabled}
            onClick={handleAddToCart}
          >
            Añadir al carrito
          </Button>
          <Button
            variant="outlined"
            fullWidth
            disabled={isDisabled}
            onClick={handleBuyNow}
          >
            Comprar ahora
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
