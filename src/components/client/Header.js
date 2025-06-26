import { Box, AppBar, Toolbar } from "@mui/material";
import Image from "next/image";
import NavBar from "@/components/client/NavBar";
import HeaderActions from "./HeaderActions";
import Link from "next/link";

export default function Header({ logo, products }) {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#f5f5f5",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: { xs: "flex", lg: "grid" },
          gridTemplateColumns: "10rem auto 10rem",
          placeItems: "center",
          justifyContent: { xs: "space-between", lg: "unset" },
          gap: "1rem",
        }}
      >
        <Link href="/">
          <Box sx={{ height: "100%", width: "auto" }}>
            {logo ? (
              <Image
                src={logo}
                width={140}
                height={100}
                alt="Logo"
                style={{ objectFit: "contain" }}
              />
            ) : (
              ""
            )}
          </Box>
        </Link>
        <NavBar />
        <HeaderActions products={products} />
      </Toolbar>
    </AppBar>
  );
}
