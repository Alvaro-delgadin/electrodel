"use client";
import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  SwipeableDrawer,
} from "@mui/material";
import { Menu, Close } from "@mui/icons-material";
import Image from "next/image";
import NavBar from "@/components/client/NavBar";
import HeaderActions from "./HeaderActions";

export default function Header({ logo }) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (value) => () => {
    setOpen(value);
  };
  return (
    <AppBar
      sx={{
        position: "sticky",
        backgroundColor: "#f5f5f5",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: { sm: "flex", md: "grid" },
          gridTemplateColumns: "10rem auto 10rem",
          placeItems: "center",
          justifyContent: { xs: "space-between", sm: "unset" },
          gap: "1rem",
        }}
      >
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
        <NavBar />
        <Toolbar sx={{ gap: "1rem", padding: 0 }}>
          <HeaderActions />
          <IconButton
            aria-label="Abrir menú"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <Menu />
          </IconButton>
        </Toolbar>
        <SwipeableDrawer
          anchor="right"
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#f5f5f5",
              },
            },
          }}
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <Box sx={{ display: "flex" }}>
            <IconButton onClick={toggleDrawer(false)}>
              <Close />
            </IconButton>
          </Box>
          <List sx={{ width: 250 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDrawer(false)}>
                <ListItemText primary="Categorías" />
              </ListItemButton>
            </ListItem>
          </List>
        </SwipeableDrawer>
      </Toolbar>
    </AppBar>
  );
}
