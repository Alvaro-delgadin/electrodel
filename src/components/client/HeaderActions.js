"use client";
import {
  Search,
  Menu,
  Close,
  ShoppingCart,
  Person,
  ArrowRight,
  Delete,
} from "@mui/icons-material";
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
  Typography,
  Button,
  Divider,
} from "@mui/material";
import categories from "@/lib/productsCategories";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/stores/cartStore";

export default function HeaderActions({ products }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const searchRef = useRef();
  const { cart, removeFromCart, clearCart } = useCartStore();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const groupedProducts = Object.values(
    products.reduce((acc, product) => {
      const key = product.product;
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {})
  );

  useEffect(() => {
    if (open === "menu") {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
        searchRef.current?.select();
      });
    }
  }, [open]);

  useEffect(() => {
    if (query?.length) {
      const filtered = groupedProducts.filter((variants) =>
        normalizeText(variants[0].product).includes(normalizeText(query))
      );
      setFiltered(filtered);
    }
  }, [query]);

  const normalizeText = (text) =>
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

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
          badgeContent={cart?.length}
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
            {filtered?.length > 0 &&
              filtered.map((variants, index) => {
                const { product, images } = variants[0];

                return (
                  <ListItem disablePadding key={index}>
                    <ListItemButton
                      sx={{ display: "flex", gap: "1rem" }}
                      onClick={() => setOpen(false)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "4rem",
                          height: "4rem",
                          minWidth: "4rem",
                          borderRadius: "0.5rem",
                          overflow: "hidden",
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        {images?.[0] ? (
                          <Image
                            src={images[0]}
                            alt={product}
                            width={64}
                            height={64}
                            style={{ objectFit: "contain" }}
                          />
                        ) : null}
                      </Box>

                      <ListItemText primary={product} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            {!query ? (
              <>
                <ListItem>
                  <ListItemText primary="Categorías" />
                </ListItem>
                <List>
                  {categories.map((cat, index) => {
                    return (
                      <Box key={index}>
                        <Link
                          href={{
                            pathname: "/productos",
                            query: { categoria: cat.category },
                          }}
                        >
                          <ListItem disablePadding>
                            <ListItemButton
                              sx={{ display: "flex", gap: "0.5rem" }}
                              onClick={() => setOpen(false)}
                            >
                              <Box
                                sx={{
                                  width: "0.5rem",
                                  height: "0.5rem",
                                  borderRadius: "0.5rem",
                                  bgcolor: "#ec3237",
                                }}
                              ></Box>
                              <ListItemText primary={cat.category} />
                              <ArrowRight />
                            </ListItemButton>
                          </ListItem>
                        </Link>
                        <List sx={{ pl: "2rem" }}>
                          {cat.subcategories.map((sub, index) => {
                            return (
                              <Link
                                href={{
                                  pathname: "/productos",
                                  query: {
                                    categoria: cat.category,
                                    subcategoria: sub,
                                  },
                                }}
                                key={index}
                              >
                                <ListItem disablePadding>
                                  <ListItemButton
                                    sx={{ display: "flex" }}
                                    onClick={() => setOpen(false)}
                                  >
                                    <ListItemText primary={sub} />
                                    <ArrowRight />
                                  </ListItemButton>
                                </ListItem>
                              </Link>
                            );
                          })}
                        </List>
                      </Box>
                    );
                  })}
                </List>
              </>
            ) : (
              ""
            )}
          </List>
        ) : (
          ""
        )}
        {open === "cart" ? (
          <List sx={{ padding: 0, width: 360 }}>
            {/* Header */}
            <ListItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => setOpen(false)}>
                  <Close />
                </IconButton>
                <Typography variant="h6">Carrito</Typography>
              </Box>
              {cart.length > 0 && (
                <Button size="small" color="error" onClick={clearCart}>
                  Vaciar
                </Button>
              )}
            </ListItem>

            {/* Lista de productos */}
            {cart.length === 0 ? (
              <ListItem>
                <ListItemText primary="Tu carrito está vacío." />
              </ListItem>
            ) : (
              cart.map((item, index) => (
                <Box key={index}>
                  <ListItem alignItems="flex-start">
                    {/* Imagen */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        overflow: "hidden",
                        mr: 2,
                      }}
                    >
                      {item.images?.[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.product}
                          width={64}
                          height={64}
                          style={{ objectFit: "contain" }}
                        />
                      )}
                    </Box>

                    {/* Detalles del producto */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" noWrap>
                        {item.product}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Color: {item.color} – {item.watts}W
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cantidad: {item.quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        Subtotal: ${item.price * item.quantity}
                      </Typography>
                    </Box>

                    {/* Botón eliminar */}
                    <IconButton
                      edge="end"
                      onClick={() =>
                        removeFromCart(item.id, item.color, item.watts)
                      }
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </Box>
              ))
            )}

            {/* Total y acción */}
            {cart.length > 0 && (
              <Box sx={{ padding: 2 }}>
                <Typography variant="h6">Total: ${total}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Finalizar compra
                </Button>
              </Box>
            )}
          </List>
        ) : (
          ""
        )}
      </SwipeableDrawer>
    </Toolbar>
  );
}
