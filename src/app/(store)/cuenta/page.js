"use client";

import { useEffect, useState } from "react";
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
export default function account() {
  const [form, setForm] = useState({ name: "", whatsapp: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("name, whatsapp, address")
        .eq("id", user.id)
        .single();

      if (data) setForm(data);
      setLoading(false);
    };

    fetchPerfil();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    setMessage(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setMessage({ type: "error", text: "No hay sesión activa." });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: "Error al guardar los cambios." });
    } else {
      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    }

    setSaving(false);
  };

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" mb={3}>
          Editar perfil
        </Typography>

        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="WhatsApp"
          name="whatsapp"
          value={form.whatsapp}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Dirección de envío"
          name="address"
          value={form.address}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
      </Box>
    </Container>
  );
}
