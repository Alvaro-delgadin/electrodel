"use client";
import { Search, Menu, Close, ShoppingCart, Person } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  SwipeableDrawer,
  Badge,
  Toolbar,
  TextField,
} from "@mui/material";
import { categories } from "../admin/productsTable";

export default function HeaderActions({ products }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const searchRef = useRef();

  useEffect(() => {
    if (open === "menu") {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  }, [open]);

  useEffect(() => {
    if (query?.length) {
      const filtered = products?.filter((product) =>
        product.product.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(filtered);
    }
  }, [query]);

  return (
    <Toolbar sx={{ gap: "1rem", paddingInline: "0 !important" }}>
      <IconButton
        sx={{ display: { xs: "none", sm: "flex" } }}
        onClick={() => {
          setOpen("menu");
        }}
      >
        <Search sx={{ fontSize: "2rem" }} />
      </IconButton>
      <IconButton aria-label="cart" onClick={() => setOpen("cart")}>
        <Badge
          badgeContent={4}
          color="primary"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "medium",
              height: "1.5rem",
              width: "1.5rem",
              borderRadius: "1rem",
            },
          }}
        >
          <ShoppingCart sx={{ fontSize: "1.8rem" }} />
        </Badge>
      </IconButton>
      <IconButton
        aria-label="user"
        sx={{ display: { xs: "none", sm: "flex" } }}
      >
        <Person sx={{ fontSize: "2rem" }} />
      </IconButton>
      <IconButton
        aria-label="Abrir menú"
        onClick={() => {
          setOpen("menu");
        }}
        sx={{ display: { xs: "flex", lg: "none" } }}
      >
        <Menu />
      </IconButton>
      <SwipeableDrawer
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
        onOpen={() => setOpen("menu")}
      >
        {open === "menu" ? (
          <List
            sx={{
              padding: 0,
            }}
          >
            <ListItem
              sx={{ paddingLeft: 0, cursor: "pointer" }}
              onClick={() => setOpen(false)}
            >
              <IconButton>
                <Close />
              </IconButton>
              <ListItemText primary="Cerrar" sx={{ color: "#666666" }} />
            </ListItem>
            <ListItem>
              <TextField
                label="Buscar"
                variant="outlined"
                fullWidth
                value={query}
                inputRef={searchRef}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
            </ListItem>
            {!query ? (
              <ListItem>
                <ListItemText primary="Categorías" />
              </ListItem>
            ) : (
              ""
            )}
            {!query
              ? categories.map((cat, index) => {
                  return (
                    <ListItem disablePadding key={index}>
                      <ListItemButton
                        sx={{ display: "flex", gap: "1rem" }}
                        onClick={() => setOpen(false)}
                      >
                        <Box
                          sx={{
                            width: "0.5rem",
                            height: "1rem",
                            bgcolor: "#ec3237",
                          }}
                        ></Box>
                        <ListItemText primary={cat.category} />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              : ""}
          </List>
        ) : (
          ""
        )}
        {open === "cart" ? (
          <List
            sx={{
              padding: 0,
            }}
          >
            <ListItem
              sx={{ paddingLeft: 0, cursor: "pointer" }}
              onClick={() => setOpen(false)}
            >
              <IconButton>
                <Close />
              </IconButton>
              <ListItemText primary="Cerrar" sx={{ color: "#666666" }} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Carrito" />
            </ListItem>
          </List>
        ) : (
          ""
        )}
      </SwipeableDrawer>
    </Toolbar>
  );
}
