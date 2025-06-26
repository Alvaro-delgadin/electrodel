import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";
export default function ErrorPage() {
  return (
    <main>
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ocurrió un error
        </Typography>
        <Typography sx={{ mb: 2 }}>
          No pudimos procesar tu compra. Intenta nuevamente más tarde.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <Link href="/pago">
            <Button variant="contained" sx={{ display: "flex", gap: "0.5rem" }}>
              <ArrowBack />
              Volver al proceso de pago
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outlined" sx={{ display: "flex", gap: "0.5rem" }}>
              <ArrowBack />
              Volver al inicio
            </Button>
          </Link>
        </Box>
      </Box>
    </main>
  );
}
