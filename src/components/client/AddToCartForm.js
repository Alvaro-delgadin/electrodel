"use client";
import { useState, useEffect } from "react";
import ProductCardMenu from "./menus/ProductCardMenu";
import ProductDetailMenu from "./menus/ProductDetailMenu";
import { useCartStore } from "@/app/stores/cartStore";

export default function AddToCartForm({
  mode,
  open,
  anchorEl,
  handleClose,
  variants,
}) {
  const [color, setColor] = useState("");
  const [watts, setWatts] = useState(0);
  const [ampere, setAmpere] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);

  const hasColor = variants.some((v) => !!v.color);
  const hasWatts = variants.some((v) => !!v.watts);
  const hasAmpere = variants.some((v) => !!v.ampere);

  const filteredColors = [
    ...new Set(
      variants
        .filter(
          (v) =>
            (!watts || v.watts === Number(watts)) &&
            (!ampere || v.ampere === ampere)
        )
        .map((v) => v.color)
    ),
  ];

  const filteredWatts = [
    ...new Set(
      variants
        .filter(
          (v) =>
            (!color || v.color === color) && (!ampere || v.ampere === ampere)
        )
        .map((v) => v.watts)
    ),
  ];

  const filteredAmperes = [
    ...new Set(
      variants
        .filter(
          (v) =>
            (!color || v.color === color) &&
            (!watts || v.watts === Number(watts))
        )
        .map((v) => v.ampere)
    ),
  ];
  useEffect(() => {
    if (!color && !watts && !ampere && variants.length > 0) {
      const first = variants[0];
      if (first.color) setColor(first.color);
      if (first.watts) setWatts(first.watts.toString());
      if (first.ampere) setAmpere(first.ampere);
    }
    setLoading(false);
  }, []);

  // Seleccionar variante según atributos seleccionados
  useEffect(() => {
    if (!hasColor && !hasWatts && !hasAmpere && variants.length === 1) {
      setSelectedVariant(variants[0]);
      return;
    }

    const variant = variants.find(
      (v) =>
        (!hasColor || v.color === color) &&
        (!hasWatts || v.watts === Number(watts)) &&
        (!hasAmpere || v.ampere === ampere)
    );
    setSelectedVariant(variant || null);
  }, [color, watts, ampere, variants, hasColor, hasWatts, hasAmpere]);

  // Autoseleccionar si hay un solo color/potencia/corriente
  useEffect(() => {
    if (
      hasColor &&
      filteredColors.length === 1 &&
      !color // solo auto-setea si color NO está seleccionado
    ) {
      setColor(filteredColors[0]);
    }
    if (
      hasWatts &&
      filteredWatts.length === 1 &&
      !watts // igual para watts
    ) {
      setWatts(filteredWatts[0].toString());
    }
    if (hasAmpere && filteredAmperes.length === 1 && !ampere) {
      setAmpere(filteredAmperes[0]);
    }
  }, [
    filteredColors,
    filteredWatts,
    filteredAmperes,
    hasColor,
    hasWatts,
    hasAmpere,
  ]);

  // Limpiar la selección si ya no es válida
  useEffect(() => {
    if (watts && !filteredWatts.includes(Number(watts))) {
      setWatts("");
    }
    if (ampere && !filteredAmperes.includes(ampere)) {
      setAmpere("");
    }
    if (color && !filteredColors.includes(color)) {
      setColor("");
    }
  }, [filteredWatts, filteredAmperes, filteredColors]);

  const quantityInCart = cart
    .filter((item) => item.id === selectedVariant?.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const maxAvailable = selectedVariant
    ? selectedVariant.stock - quantityInCart
    : 0;

  const price = selectedVariant?.price || 0;

  const discount = !isNaN(selectedVariant?.discount)
    ? selectedVariant?.discount
    : 0;

  const priceWithDiscount = price * (1 - discount / 100);

  const finalPrice =
    quantity && !isNaN(quantity) ? priceWithDiscount * Number(quantity) : 0;
  const handleAddToCart = () => {
    if (selectedVariant && Number(quantity) > 0) {
      const item = {
        ...selectedVariant,
        quantity: Number(quantity),
        finalPrice,
      };
      addToCart(item);
      if (mode === "card") handleClose();
    }
  };
  const handleReset = () => {
    setColor("");
    setWatts("");
    setAmpere("");
    setQuantity("1");
    setSelectedVariant(null);
  };
  const props = {
    anchorEl,
    open,
    handleClose,
    handleReset,
    handleAddToCart,
    hasColor,
    hasWatts,
    hasAmpere,
    filteredColors,
    filteredWatts,
    filteredAmperes,
    color,
    setColor,
    watts,
    setWatts,
    ampere,
    setAmpere,
    quantity,
    setQuantity,
    maxAvailable,
    selectedVariant,
    finalPrice,
    discount,
    priceWithDiscount,
    loading,
  };
  return (
    <>
      {mode === "card" ? <ProductCardMenu {...props} /> : ""}
      {mode === "detail" ? <ProductDetailMenu {...props} /> : ""}
    </>
  );
}
