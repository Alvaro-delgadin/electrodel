"use client";
import { useCartStore } from "@/app/stores/cartStore";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPreference } from "@/app/checkout/actions"; // 🚨 importá el server action
import { useTransition } from "react";

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [isPending, startTransition] = useTransition();

  const total = cart.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0
  );

  const handleRealPayment = () => {
    startTransition(async () => {
      const url = await createPreference(cart);
      window.location.href = url; // redirige a Mercado Pago
    });
  };

  // tu handleSuccess (simulación) puede quedar como backup

  return (
    <main>
      <Box sx={{ maxWidth: "30rem", margin: "2rem auto", padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          Resumen del pedido
        </Typography>

        <List>
          {cart.map((item, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemText
                  primary={`${item.product} — ${item.color}, ${item.watts}W`}
                  secondary={`Cantidad: ${item.quantity}`}
                />
                <Typography>
                  $
                  {(
                    item.price *
                    (1 - item.discount / 100) *
                    item.quantity
                  ).toFixed(2)}
                </Typography>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Total: ${total.toFixed(2)}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 3, flexDirection: "column" }}>
          <Button
            onClick={handleRealPayment}
            variant="contained"
            color="primary"
            disabled={isPending}
          >
            {isPending ? "Redirigiendo..." : "Pagar con Mercado Pago"}
          </Button>

          <Button variant="outlined" color="success">
            Simular pago exitoso
          </Button>

          <Link href="/pago/error">
            <Button variant="outlined" color="error" fullWidth>
              Simular error de pago
            </Button>
          </Link>
        </Box>
      </Box>
    </main>
  );
}
