import { Box, Typography } from "@mui/material";

export default async function Banner({ message }) {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "black",
        color: "#fff",
        textAlign: "center",
        py: "0.75rem",
        px: "1rem",
        fontWeight: "bold",
        fontSize: "1rem",
        zIndex: 1000,
      }}
    >
      <Typography>{message}</Typography>
    </Box>
  );
}
