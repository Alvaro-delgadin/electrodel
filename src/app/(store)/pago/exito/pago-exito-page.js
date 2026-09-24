"use client";
import { Box, Typography, Button } from "@mui/material";
import { ArrowBack, WhatsApp } from "@mui/icons-material";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient.js";
import { useEffect, useState } from "react";
import { useCartStore } from "@/app/stores/cartStore";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const isWholesale = searchParams.get("tipo") === "mayorista";
  const [whatsapp, setWhatsapp] = useState("");

  const fetchData = async () => {
    const {
      data: { whatsapp },
    } = await supabase.from("settings").select("whatsapp").single();
    setWhatsapp(whatsapp);
  };

  useEffect(() => {
    fetchData();
    clearCart();
  }, []);

  return (
    <main>
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isWholesale ? "¡Pedido recibido!" : "¡Compra exitosa!"}
        </Typography>
        <Typography sx={{ mb: 2 }}>
          {isWholesale
            ? "Registramos tu pedido mayorista. Te contactaremos para coordinar el pago y el envío."
            : "Gracias por tu compra. Ahora podes coordinar tu envío por WhatsApp."}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <Link href="/">
            <Button variant="outlined" sx={{ display: "flex", gap: "0.5rem" }}>
              <ArrowBack />
              Volver al inicio
            </Button>
          </Link>
          <Button
            component="a"
            href={`https://wa.me/+54${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{ display: "flex", gap: "0.5rem" }}
          >
            <WhatsApp />
            {isWholesale ? "Consultar por WhatsApp" : "Coordinar envío"}
          </Button>
        </Box>
      </Box>
    </main>
  );
}
