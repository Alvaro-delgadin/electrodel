import { Box, Typography, Button } from "@mui/material";
import { ArrowBack, WhatsApp } from "@mui/icons-material";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

export default async function SuccessPage() {
  const supabase = await createClient();
  const {
    data: { whatsapp },
  } = await supabase.from("settings").select("whatsapp").single();

  return (
    <main>
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h4" gutterBottom>
          ¡Compra exitosa!
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Gracias por tu compra. Ahora podes coordinar tu envío por WhatsApp.
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
            Coordinar envío
          </Button>
        </Box>
      </Box>
    </main>
  );
}
