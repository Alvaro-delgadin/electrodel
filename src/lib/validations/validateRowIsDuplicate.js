export default function validateRowIsDuplicate(row, rows) {
  const isDuplicate = rows.some(
    (r) =>
      r.id !== row.id &&
      r.product === row.product &&
      r.watts === row.watts &&
      r.color === row.color
  );

  if (isDuplicate) {
    throw new Error(
      "Ya existe un producto con los mismos valores (producto, watts y color)."
    );
  }
}
