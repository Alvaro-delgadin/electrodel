"use client";
import { useCartStore } from "@/app/stores/cartStore";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  AlertTitle,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { createPreference } from "@/app/checkout/actions";
import { useTransition } from "react";
import formatPrice from "@/lib/client/formatters/formatPrice";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [isWholesale, setIsWholesale] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    address: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  const total = cart.reduce(
    (acc, item) => acc + item.price * (1 - item.discount / 100) * item.quantity,
    0
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("name, whatsapp, address, email")
        .eq("id", user.id)
        .single();

      if (data) setForm(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Minorista: todos los campos. Mayorista: nombre, whatsapp y dirección (email opcional)
  const isFormComplete = isWholesale
    ? form.name && form.whatsapp.length > 6 && form.address
    : form.name && form.whatsapp.length > 6 && form.address && form.email;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "whatsapp") {
      const clean = value.replace(/[^\d]/g, "");
      setForm((prev) => ({ ...prev, whatsapp: `+54${clean}` }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRealPayment = () => {
    startTransition(async () => {
      const url = await createPreference(cart, form);
      window.location.href = url;
    });
  };

  // Paso 1: solo UI. El envío real del pedido mayorista va en el siguiente paso.
  const handleWholesaleOrder = () => {
    startTransition(async () => {
      // Placeholder: más adelante crea orders + order_items en el servidor
      console.log("Pedido mayorista (pendiente de implementar backend):", {
        form,
        cart,
        total,
      });
      alert(
        "Pedido mayorista: la interfaz ya está lista. El registro en el servidor se implementa en el próximo paso."
      );
    });
  };

  return (
    <main>
      {loading ? (
        <CircularProgress size={40} sx={{ m: "auto" }} />
      ) : cart.length ? (
        <Box
          sx={{
            maxWidth: "30rem",
            margin: "2rem auto",
            padding: "2rem",
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h4" fontSize={"1.5rem"} gutterBottom>
            Resumen del pedido
          </Typography>

          <List>
            {cart.map((item, index) => {
              const detalles = [];

              if (item.color) detalles.push(item.color);
              if (item.watts > 0) detalles.push(`${item.watts}W`);
              if (item.ampere) detalles.push(`${item.ampere}`);
              if (item.voltage) detalles.push(`${item.voltage}`);

              return (
                <Box key={index}>
                  <ListItem>
                    <ListItemAvatar
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "4rem",
                        mr: "1rem",
                      }}
                    >
                      <Image
                        src={item.images[0]}
                        width={56}
                        height={56}
                        alt={item.product}
                        style={{
                          objectFit: "contain",
                          height: "100%",
                          width: "100%",
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ mr: "0.5rem" }}
                      primary={`${item.product}${
                        detalles.length ? " — " + detalles.join(", ") : ""
                      }`}
                      secondary={
                        item.quantity > 0 ? `Cantidad: ${item.quantity}` : ""
                      }
                    />
                    <Typography>
                      $
                      {formatPrice(
                        item.price * (1 - item.discount / 100) * item.quantity
                      )}
                    </Typography>
                  </ListItem>
                  <Divider />
                </Box>
              );
            })}
          </List>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ${formatPrice(total)}
          </Typography>

          <Typography
            variant="h4"
            fontSize="1.5rem"
            sx={{ mt: "3rem" }}
            gutterBottom
          >
            Datos del cliente
          </Typography>

          <Box sx={{ display: "flex", gap: 4, mt: 3, flexDirection: "column" }}>
            {/* Opción mayorista arriba de todo el formulario */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isWholesale}
                  onChange={(e) => setIsWholesale(e.target.checked)}
                  color="primary"
                />
              }
              label="Soy mayorista (pedido sin pago online)"
            />

            {isWholesale && (
              <Alert severity="info" variant="outlined">
                Te contactaremos para coordinar el pago. Completá los datos a
                nombre de quién es el pedido.
              </Alert>
            )}

            <TextField
              label={isWholesale ? "A nombre de" : "Nombre"}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              helperText={
                isWholesale
                  ? "Nombre o razón social del mayorista"
                  : undefined
              }
            />
            <TextField
              label="WhatsApp"
              name="whatsapp"
              value={form.whatsapp.replace(/^\+54/, "")}
              onChange={handleChange}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">+54</InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Dirección de envío"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <TextField
              label="Correo electrónico"
              name="email"
              value={form.email}
              onChange={handleChange}
              required={!isWholesale}
              helperText={
                isWholesale ? "Opcional para pedidos mayoristas" : undefined
              }
            />

            {isWholesale ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  No se procesa pago online. El pedido quedará registrado para
                  coordinación comercial.
                </Typography>
                <Button
                  onClick={handleWholesaleOrder}
                  variant="contained"
                  color="primary"
                  sx={{
                    color: "white",
                    fontSize: "1.1rem",
                    p: "1rem 2rem",
                    textTransform: "none",
                  }}
                  disabled={!isFormComplete || isPending}
                >
                  {isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Enviar pedido"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="h4"
                  fontSize="1.5rem"
                  sx={{ mt: "3rem" }}
                  gutterBottom
                >
                  Pagar con:
                </Typography>
                <Button
                  onClick={() => handleRealPayment(form)}
                  variant="contained"
                  sx={{
                    color: "white",
                    fontSize: "1.2rem",
                    border: "#1a78c2 2px solid",
                    bgcolor: "white",
                    p: "1rem 2rem",
                  }}
                  disabled={!isFormComplete || isPending}
                >
                  {isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Image
                      style={{ height: "2rem", width: "auto" }}
                      width={100}
                      height={50}
                      alt="Mercado Pago Logo"
                      src="https://xubpgfhalwywsuxasqlm.supabase.co/storage/v1/object/public/assets/mp%20logo.webp"
                    />
                  )}
                </Button>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Alert
            icon={<ShoppingCart fontSize="inherit" />}
            severity="info"
            variant="outlined"
            color="primary"
          >
            <AlertTitle>Carrito vacío</AlertTitle>
            Agregá productos para iniciar tu compra.
          </Alert>
        </Box>
      )}
    </main>
  );
}
