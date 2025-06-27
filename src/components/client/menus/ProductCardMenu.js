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
        {hasColor && (
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
        )}

        {hasWatts && (
          <FormControl fullWidth>
            <InputLabel>Potencia</InputLabel>
            <Select
              value={watts}
              onChange={(e) => setWatts(e.target.value)}
              label="Potencia"
            >
              {filteredWatts.map((w) => (
                <MenuItem key={w} value={w}>
                  {w}W
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {hasAmpere && (
          <FormControl fullWidth>
            <InputLabel>Corriente (A)</InputLabel>
            <Select
              value={ampere}
              onChange={(e) => setAmpere(e.target.value)}
              label="Corriente"
            >
              {filteredAmperes.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
          disabled={
            !selectedVariant ||
            Number(quantity) < 1 ||
            Number(quantity) > maxAvailable ||
            maxAvailable < 1 ||
            (hasColor && !color) ||
            (hasWatts && !watts)
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
  );
}
