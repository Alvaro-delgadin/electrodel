import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // o 'dark'
    primary: {
      main: "#ec3037",
    },
    secondary: {
      main: "#666666",
    },
    background: {
      default: "#f5f5f5",
    },
    text: {
      primary: "#000000", // texto principal
      secondary: "#666666", // texto menos destacado
      disabled: "#aaaaaa", // texto inactivo/deshabilitado
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // para que no esté todo en mayúsculas
        },
      },
    },
  },
});

export default theme;
