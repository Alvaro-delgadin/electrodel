"use client";
import {
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
import formatPrice from "@/lib/client/formatters/formatPrice";
export default function ProductCardMenu({
  anchorEl,
  open,
  handleClose,
  handleReset,
  handleAddToCart,
  attributes,
  labelMap,
  isDisabled,
  attributesToShow,
  getFilteredOptions,
  getSelectedValue,
  setSelectedValue,
  variants,
  quantity,
  setQuantity,
  maxAvailable,
  selectedVariant,
  finalPrice,
  discount,
  priceWithDiscount,
  loading,
}) {
  return (
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
        {attributesToShow.map((attr) => {
          const options = getFilteredOptions(attr);
          if (options.length === 0) return null; // extra seguridad

          return (
            <FormControl key={attr} fullWidth>
              <InputLabel>{labelMap[attr] || attr}</InputLabel>
              <Select
                sx={{
                  height: "3.5rem",
                }}
                value={getSelectedValue(attr) || ""}
                onChange={(e) => setSelectedValue(attr, e.target.value)}
                label={labelMap[attr] || attr}
                size="small"
              >
                {options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {attr === "watts"
                      ? `${opt}W`
                      : attr === "ampere"
                      ? `${opt}`
                      : attr === "voltage"
                      ? `${opt}`
                      : opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })}
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
          Precio final: ${formatPrice(finalPrice)}
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
          disabled={isDisabled}
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
  );
}
