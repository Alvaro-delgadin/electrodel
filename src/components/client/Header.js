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
        backgroundColor: "#ec3237",
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
          p: "0.5rem",
        }}
      >
        <Link href="/">
          <Box
            sx={{
              height: "5rem",
              p: "0.5rem 1rem",
              borderRadius: "0.5rem",
              bgcolor: "#f5f5f5",
            }}
          >
            {logo ? (
              <Image
                src={logo}
                width={100}
                height={80}
                alt="Logo"
                style={{ objectFit: "contain", height: "100%", width: "auto" }}
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
