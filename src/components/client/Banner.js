import { Box, Typography } from "@mui/material";
import Marquee from "react-fast-marquee";
export default function Banner({ message }) {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "black",
        color: "#fff",
        p: "0.5rem 0",
        fontWeight: "bold",
        fontSize: "1rem",
        zIndex: 1000,
      }}
    >
      <Marquee speed={100} direction="right" pauseOnHover={true}>
        <Typography sx={{ mx: 4, fontWeight: "bold" }}>{message}</Typography>
      </Marquee>
    </Box>
  );
}
