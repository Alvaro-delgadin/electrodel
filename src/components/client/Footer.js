import { Box, Divider, Typography } from "@mui/material";
import Image from "next/image";

export default function Footer({ logo, location, schedule }) {
  return (
    <Box
      sx={{
        display: "flex",
        padding: "1rem 4rem",
        borderTop: "1px solid #666666",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: "1rem", sm: "4rem" },
        flexWrap: "wrap",
      }}
    >
      <Image
        src={logo}
        height={100}
        width={150}
        alt="Electrodel - Electricidad e Iluminación"
        style={{ objectFit: "contain" }}
      />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: "2rem", sm: "1rem" },
          maxWidth: { xs: "10rem", md: "unset" },
        }}
      >
        <Typography sx={{ maxWidth: "16rem" }}>
          Dirección: {location}
        </Typography>
        <Typography sx={{ maxWidth: "16rem" }}>
          Horarios de atención: {schedule}
        </Typography>
      </Box>
    </Box>
  );
}
