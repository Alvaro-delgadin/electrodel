import { esES } from "@mui/x-data-grid/locales";
import { createTheme } from "@mui/material";
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ec3237",
    },
    background: {
      default: "#202020",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&": {
            minWidth: "2.5rem",
            minHeight: "2.5rem",
            borderRadius: 30,
            color: "var(--font)",
          },
          "&:hover": {
            backgroundColor: "var(--background)", // hover global para botones
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        cell: {
          "&.MuiDataGrid-cell--editing": {
            backgroundColor: "var(--background)",
          },
        },
        row: {
          "&:hover": {
            backgroundColor: "var(--background-secondary)",
          },
          "&.noHover:hover": {
            backgroundColor: "transparent", // ← anula hover solo si tiene esta clase
          },
          "&.inactiveProduct": {
            color: "#777",
          },
        },
      },
    },
  },
  esES,
});
