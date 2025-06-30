"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function Ingresar() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const loginWithEmail = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Ingresá un email válido." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://electrodel.com.ar/cuenta",
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Revisá tu correo para continuar." });
    }
  };

  return (
    <main>
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" mb={3}>
            Ingresar
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loginWithEmail();
            }}
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={loginWithEmail}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Ingresar con Email"}
          </Button>
        </Box>
      </Container>
    </main>
  );
}
