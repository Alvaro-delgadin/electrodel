import { Box, MenuItem, Button } from "@mui/material";
import {
  ElectricalServices,
  Light,
  WbTwighlight,
  WbIncandescent,
  Build,
} from "@mui/icons-material";
import categories from "@/lib/productsCategories";
import Link from "next/link";

export default function NavBar() {
  const iconsInOrder = [
    <Light key={1} />,
    <WbTwighlight key={2} />,
    <WbIncandescent key={3} />,
    <ElectricalServices key={4} />,
    <Build key={5} />,
  ];
  return (
    <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 2 }}>
      {categories?.map((cat, index) => (
        <Box
          key={cat.category}
          sx={{
            position: "relative",
            "&:hover .submenu": {
              display: "block",
            },
          }}
        >
          <Link
            href={{
              pathname: "/productos",
              query: { categoria: cat.category },
            }}
          >
            <Button
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "white",
                fontSize: "1rem",
              }}
            >
              {iconsInOrder[index]}
              {cat.category}
            </Button>
          </Link>
          <Box
            className="submenu"
            sx={{
              display: "none",
              position: "absolute",
              top: "100%",
              left: 0,
              bgcolor: "white",
              color: "black",
              boxShadow: 3,
              zIndex: 10,
              minWidth: 160,
            }}
          >
            {cat.subcategories.map((sub) => (
              <Link
                href={{
                  pathname: "/productos",
                  query: { categoria: cat.category, subcategoria: sub },
                }}
                key={sub}
              >
                <MenuItem
                  sx={{
                    p: "0.8rem 1rem",
                  }}
                >
                  {sub}
                </MenuItem>
              </Link>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
