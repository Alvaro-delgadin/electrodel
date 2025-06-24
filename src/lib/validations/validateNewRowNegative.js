export default function validateNewRowNegative(columns, row) {
  const negativeFields = columns
    .filter(
      (col) =>
        col.type === "number" &&
        typeof row[col.field] === "number" &&
        row[col.field] < 0
    )
    .map((col) => col.headerName || col.field);

  if (negativeFields.length > 0) {
    throw new Error(
      `Los siguientes campos no pueden ser negativos: ${negativeFields.join(
        ", "
      )}`
    );
  }
}
