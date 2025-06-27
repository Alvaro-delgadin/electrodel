"use client";
import { Close, Delete } from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import formatPrice from "@/lib/client/formatters/formatPrice";
import { useCartStore } from "@/app/stores/cartStore";
import Image from "next/image";

export default function CartMenu({ setOpen }) {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const total = cart.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0
  );

  return (
    <List sx={{ padding: 0, width: 360 }}>
      {/* Header */}
      <ListItem
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
          <Typography variant="h6">Carrito</Typography>
        </Box>
        {cart.length > 0 && (
          <Button size="small" color="error" onClick={clearCart}>
            Vaciar
          </Button>
        )}
      </ListItem>

      {/* Lista de productos */}
      {cart.length === 0 ? (
        <ListItem>
          <ListItemText primary="Tu carrito está vacío." />
        </ListItem>
      ) : (
        cart.map((item, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start">
              {/* Imagen */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  overflow: "hidden",
                  mr: 2,
                }}
              >
                {item.images?.[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.product}
                    width={64}
                    height={64}
                    style={{ objectFit: "contain" }}
                  />
                )}
              </Box>

              {/* Detalles del producto */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "14rem",
                  }}
                >
                  {item.product}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Color: {item.color} – {item.watts}W
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cantidad: {item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Subtotal: $
                  {formatPrice(
                    item.price * (1 - item.discount / 100) * item.quantity
                  )}
                </Typography>
              </Box>

              {/* Botón eliminar */}
              <IconButton
                edge="end"
                onClick={() => removeFromCart(item.id, item.color, item.watts)}
              >
                <Delete />
              </IconButton>
            </ListItem>
            <Divider />
          </Box>
        ))
      )}

      {/* Total y acción */}
      {cart.length > 0 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Total: ${formatPrice(total)}</Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setOpen(false);
              router.push("/pago");
            }}
          >
            Finalizar compra
          </Button>
        </Box>
      )}
    </List>
  );
}
