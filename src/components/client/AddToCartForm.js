"use client";
import { useState, useEffect, useMemo } from "react";
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
  const [quantity, setQuantity] = useState("1");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [selected, setSelected] = useState({
    color: "",
    watts: "",
    ampere: "",
    voltage: "",
  });
  const attributes = ["color", "watts", "ampere", "voltage"];
  const labelMap = {
    color: "Color",
    watts: "Potencia (W)",
    ampere: "Corriente (A)",
    voltage: "Tensión (V)",
  };
  const getSelectedValue = (attr) => selected[attr];
  const setSelectedValue = (attr, value) =>
    setSelected((prev) => ({ ...prev, [attr]: value }));
  const attributesToShow = attributes.filter((attr) =>
    variants.some((v) => v[attr] !== undefined && v[attr] !== null)
  );

  const getFilteredOptions = (attribute) => {
    return [
      ...new Set(
        variants
          .filter((v) =>
            attributes.every(
              (attr) =>
                attr === attribute || // ignoramos el que estamos calculando
                !getSelectedValue(attr) || // si no está seteado, lo ignoramos
                (attr === "watts"
                  ? v[attr] === Number(getSelectedValue(attr))
                  : v[attr] === getSelectedValue(attr))
            )
          )
          .map((v) => v[attribute])
          .filter(Boolean)
      ),
    ];
  };

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
  useEffect(() => {
    if (
      variants.length > 0 &&
      attributes.every((attr) => !getSelectedValue(attr))
    ) {
      const first = variants[0];
      const initial = {};
      attributes.forEach((attr) => {
        if (first[attr] !== undefined && first[attr] !== null) {
          initial[attr] = first[attr].toString();
        }
      });
      setSelected((prev) => ({ ...prev, ...initial }));
      setLoading(false);
    }
  }, []);

  // Seleccionar variante según atributos seleccionados
  useEffect(() => {
    const match = variants.find((v) =>
      attributes.every((attr) =>
        !getSelectedValue(attr)
          ? true
          : attr === "watts"
          ? v[attr] === Number(getSelectedValue(attr))
          : v[attr] === getSelectedValue(attr)
      )
    );
    setSelectedVariant(match || null);
  }, [selected, variants]);

  // Autoseleccionar si hay un solo color/potencia/corriente
  useEffect(() => {
    attributes.forEach((attr) => {
      const filtered = getFilteredOptions(attr);
      const current = getSelectedValue(attr);
      if (filtered.length === 1 && !current) {
        setSelectedValue(attr, filtered[0].toString());
      }
    });
  }, [variants, selected]);

  // Limpiar la selección si ya no es válida
  useEffect(() => {
    attributes.forEach((attr) => {
      const filtered = getFilteredOptions(attr);
      const current = getSelectedValue(attr);
      if (
        current &&
        !filtered.includes(attr === "watts" ? Number(current) : current)
      ) {
        setSelectedValue(attr, "");
      }
    });
  }, [variants, selected]);

  const requiredAttributes = useMemo(() => {
    return attributes.filter((attr) => {
      const values = new Set(
        variants
          .map((v) => v[attr])
          .filter((v) => v !== null && v !== undefined)
      );
      return values.size > 1;
    });
  }, [variants, attributes]);

  const isDisabled = useMemo(() => {
    if (!selectedVariant) return true;
    if (Number(quantity) < 1 || Number(quantity) > maxAvailable) return true;
    if (maxAvailable < 1) return true;

    for (const attr of requiredAttributes) {
      const val = getSelectedValue(attr);
      if (!val || val.toString().trim() === "") return true;
    }

    return false;
  }, [
    selectedVariant,
    quantity,
    maxAvailable,
    requiredAttributes,
    attributes.map(getSelectedValue),
  ]);

  const handleReset = () => {
    const reset = {};
    attributes.forEach((attr) => (reset[attr] = ""));
    setSelected(reset);
    setQuantity("1");
    setSelectedVariant(null);
  };
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
  const props = {
    anchorEl,
    open,
    handleClose,
    handleReset,
    handleAddToCart,
    attributes,
    labelMap,
    isDisabled,
    attributesToShow,
    getFilteredOptions,
    getSelectedValue,
    setSelectedValue,
    variants,
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
