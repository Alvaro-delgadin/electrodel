"use client";
import { Search, Menu, ShoppingCart, Person } from "@mui/icons-material";
import { useState } from "react";
import { IconButton, Drawer, Badge, Toolbar } from "@mui/material";
import CartMenu from "./menus/CartMenu";
import MainMenu from "./menus/MainMenu";
import { useCartStore } from "@/app/stores/cartStore";

export default function HeaderActions({ products }) {
  const [open, setOpen] = useState(false);
  const { cart } = useCartStore();

  return (
    <Toolbar sx={{ gap: "1rem", paddingInline: "0 !important" }}>
      <IconButton
        sx={{ display: { xs: "none", sm: "flex" } }}
        onClick={() => {
          setOpen("menu");
        }}
      >
        <Search sx={{ fontSize: "2rem", color: "white" }} />
      </IconButton>
      <IconButton aria-label="cart" onClick={() => setOpen("cart")}>
        <Badge
          badgeContent={cart?.length}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "medium",
              height: "1.5rem",
              width: "1.5rem",
              borderRadius: "1rem",
              bgcolor: "black",
              color: "white",
              fontWeight: "bold",
            },
          }}
        >
          <ShoppingCart sx={{ fontSize: "1.8rem", color: "white" }} />
        </Badge>
      </IconButton>
      <IconButton
        aria-label="user"
        sx={{ display: { xs: "none", sm: "flex" } }}
      >
        <Person sx={{ fontSize: "2rem", color: "white" }} />
      </IconButton>
      <IconButton
        aria-label="Abrir menú"
        onClick={() => {
          setOpen("menu");
        }}
        sx={{ display: { xs: "flex", lg: "none" } }}
      >
        <Menu sx={{ color: "white", fontSize: "2rem" }} />
      </IconButton>
      <Drawer
        anchor="right"
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#f5f5f5",
              width: { xs: "100%", sm: 400 },
            },
          },
        }}
        sx={{ gap: 0 }}
        open={open}
        onClose={() => setOpen(false)}
      >
        {open === "menu" ? (
          <MainMenu setOpen={setOpen} products={products} />
        ) : (
          ""
        )}
        {open === "cart" ? <CartMenu setOpen={setOpen} /> : ""}
      </Drawer>
    </Toolbar>
  );
}
