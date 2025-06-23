import Image from "next/image";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
export default function ProductList({ products }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr",
        },
        gap: 2,
      }}
    >
      {products?.map((product) => (
        <Card
          sx={{
            width: "18rem",
            bgcolor: "#f5f5f5",
            transition: "filter 0.3s ease",
            filter: "brightness(1)",
            "&:hover": {
              filter: "brightness(0.9) contrast(1.3)",
            },
          }}
          key={product.id}
        >
          {product?.images[0] ? (
            <Image
              height={200}
              width={320}
              src={product.images[0]}
              alt={product.product}
              style={{
                objectFit: "contain",
              }}
            />
          ) : (
            <Box height={200} width={320}></Box>
          )}
          <CardContent>
            <Typography variant="h6" component="div" noWrap>
              {product.product}
            </Typography>
            <Typography variant="body2" color="secondary">
              {product.category}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              ${product.price}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              fullWidth
              variant="contained"
              sx={{ padding: "0.5rem", gap: "0.5rem" }}
            >
              Agregar al carrito
              <ShoppingCart />
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
