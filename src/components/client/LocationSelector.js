"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { useLocationStore } from "@/app/stores/locationStore";

// `locations` llega desde el server (layout.js) con las zonas activas:
// [{ id, name }, ...]
export default function LocationSelector({ locations = [] }) {
  const { location, setLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Evita mismatch de hidratación: recién después del mount miramos
  // si hay o no una zona guardada en localStorage.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !locations.length) return;
    if (!location) setOpen(true);
  }, [hydrated, location, locations]);

  if (!locations.length) return null;

  const handleSelect = (name) => {
    setLocation(name);
    setOpen(false);
  };

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          width: "100%",
          bgcolor: "#f5f5f5",
          color: "#000",
          p: "0.5rem",
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        <LocationOn sx={{ fontSize: "1.1rem" }} />
        {hydrated && location ? (
          <span>
            Envíos a <strong>{location}</strong> (cambiar)
          </span>
        ) : (
          <span>Elegí tu zona para ver los envíos disponibles</span>
        )}
      </Box>

      <Modal
        open={open}
        onClose={() => location && setOpen(false)}
        aria-labelledby="location-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "var(--bg)",
            borderRadius: 2,
            p: 3,
            maxWidth: "24rem",
            width: "90%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            ¿Dónde recibís tu pedido?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elegí tu zona para ver los productos y envíos disponibles.
          </Typography>
          <List>
            {locations.map((loc) => (
              <ListItemButton
                key={loc.id}
                selected={loc.name === location}
                onClick={() => handleSelect(loc.name)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemText primary={loc.name} />
              </ListItemButton>
            ))}
          </List>
          {location && (
            <Button fullWidth onClick={() => setOpen(false)} sx={{ mt: 1 }}>
              Cerrar
            </Button>
          )}
        </Box>
      </Modal>
    </>
  );
}
