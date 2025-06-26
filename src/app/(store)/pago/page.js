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
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const total = cart.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0
  );

  const handleSuccess = async () => {
    // 1. Insertar la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client: "Sin nombre", // o desde un formulario
        status: "pending",
        total: 0,
        active: true,
      })
      .select()
      .single();

    if (orderError) return console.error("Error al crear order", orderError);

    // 2. Insertar la venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total,
        payment_method: "mercado_pago", // o efectivo, etc.
        customer_name: "Sin nombre", // opcional
      })
      .select()
      .single();

    if (saleError) return console.error("Error al crear sale", saleError);

    // 3. Insertar los ítems y disminuir stock
    for (const item of cart) {
      // 3a. Crear order_items
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: 0,
        discount: item.discount,
      });

      // 3b. (opcional) Crear sale_items
      await supabase.from("sale_items").insert({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount,
      });

      // 4. Disminuir el stock
      const { data, error } = await supabase.rpc("decrease_stock", {
        product_id: item.id,
        amount: item.quantity,
      });
      console.log(error);
    }

    // 5. Limpiar carrito y redirigir
    clearCart();
    router.push("/pago/exito");
  };

  return (
    <main>
      <Box sx={{ maxWidth: 600, margin: "2rem auto", padding: 2 }}>
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

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            onClick={handleSuccess}
            variant="contained"
            color="success"
            fullWidth
          >
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
