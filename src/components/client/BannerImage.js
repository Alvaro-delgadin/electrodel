"use client";
import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import Image from "next/image";

const ROTATE_INTERVAL_MS = 5000;
const FADE_MS = 800;

const chunkPairs = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Muestra las imágenes cuadradas del banner promocional, con
// rotación automática y fade cruzado cada 5s cuando hay más de
// una imagen/par para mostrar.
//
// - Desktop: se agrupan de a pares fijos (1-2, luego 3-4, etc.)
//   y esos pares van rotando.
// - Mobile: se muestra 1 imagen a la vez, rotando entre todas
//   las imágenes cargadas (no solo la primera de cada par).
export default function BannerImage({ images = [] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images.length) return null;

  const pairs = chunkPairs(images, 2);
  const activePairIndex = tick % pairs.length;
  const activeImageIndex = tick % images.length;

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Versión mobile: 1 imagen a la vez, rotando entre todas */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          justifyContent: "center",
          position: "relative",
          width: "100%",
          height: "15rem",
        }}
      >
        {images.map((img, index) => (
          <Box
            key={img + index}
            sx={{
              position: "absolute",
              inset: 0,
              opacity: index === activeImageIndex ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Image
                src={img}
                alt="Banner promocional"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Versión desktop: pares fijos de 2 imágenes, rotando */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          position: "relative",
          width: "100%",
          height: "15rem",
        }}
      >
        {pairs.map((pair, pairIndex) => (
          <Box
            key={pairIndex}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              opacity: pairIndex === activePairIndex ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            {pair.map((img, index) => (
              <Box
                key={img + index}
                sx={{
                  position: "relative",
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={img}
                  alt={`Banner promocional ${index + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ height: "100%", width: "auto" }}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
