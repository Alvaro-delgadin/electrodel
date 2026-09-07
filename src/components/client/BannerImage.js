import { Box } from "@mui/material";
import Image from "next/image";

// Muestra las imágenes cuadradas del banner promocional.
// En PC se muestran hasta 2 imágenes en fila (lado a lado).
// En mobile se muestra solo la primera imagen, a ancho completo.
export default function BannerImage({ images = [] }) {
  if (!images.length) return null;

  const desktopImages = images.slice(0, 2);
  const mobileImage = images[0];

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: "0.5rem", sm: "1rem" },
      }}
    >
      {/* Versión mobile: 1 sola imagen */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Image
          src={mobileImage}
          alt="Banner promocional"
          fill
          style={{ objectFit: "cover" }}
        />
      </Box>

      {/* Versión desktop: hasta 2 imágenes en fila */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          gap: "1rem",
          width: "100%",
        }}
      >
        {desktopImages.map((img, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              aspectRatio: "1 / 1",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={img}
              alt={`Banner promocional ${index + 1}`}
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
