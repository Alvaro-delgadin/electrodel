"use client";
import { Close, ArrowRight, QuestionAnswer } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import categories from "@/lib/productsCategories";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import groupProducts from "@/lib/client/utils/groupProducts";
export default function MainMenu({ setOpen, products }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const searchRef = useRef();
  const groupedProducts = groupProducts(products);
  useEffect(() => {
    searchRef.current?.focus();
    searchRef.current?.select();
  }, []);
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
                onClick={() => {
                  setOpen(false);
                  router.push(`/producto/${variants[0].id}`);
                }}
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
          <ListItem
            sx={{ paddingLeft: 0, cursor: "pointer" }}
            onClick={() => {
              setOpen(false);
              router.push("/preguntas-frecuentes");
            }}
          >
            <IconButton>
              <QuestionAnswer sx={{ color: "#ec3237" }} />
            </IconButton>
            <ListItemText primary="Preguntas frecuentes" />
            <ArrowRight />
          </ListItem>
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
  );
}
