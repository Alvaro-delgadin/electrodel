"use client";
import "@/styles/admin/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ThemeProvider, CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Navbar from "@/components/admin/Navbar.js";
import { theme } from "@/components/admin/theme";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    checkSession();
    setHasMounted(true);
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin");
    } else {
      setLoading(false);
    }
  };

  if (!hasMounted) {
    // Evitar render SSR con MUI (no emitir spinner)
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <CircularProgress color="var(--primary)" size={60} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      {children}
    </ThemeProvider>
  );
}
