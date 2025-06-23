"use client";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

export default function ThemeRegistry({ children }) {
  // Esto evita reusar cache entre renders

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
