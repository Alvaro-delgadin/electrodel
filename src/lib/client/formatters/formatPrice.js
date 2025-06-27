export default function formatPrice(price) {
  const rounded = Number(price).toFixed(2);
  const formatted = rounded.endsWith(".00") ? parseInt(rounded) : rounded;
  return formatted.toLocaleString("es-AR");
}
