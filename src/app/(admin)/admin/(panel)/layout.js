"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import "@/styles/admin/globals.css";
import Sidebar from "@/components/admin/sidebar.js";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/components/admin/theme";
export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setHasMounted(true); // Esto asegura que ya estamos en cliente
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

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

    checkSession();
  }, [hasMounted]);

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
    <>
      <Sidebar />
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </>
  );
}
