export default function validateNewRowRequired(columns, row) {
  const requiredFields = columns.filter((col) => col.nullable === false);

  const missingFields = [];

  for (const col of requiredFields) {
    const value = row[col.field];

    if (col.type === "string") {
      if (typeof value !== "string" || value.trim() === "") {
        missingFields.push(col.headerName || col.field);
      }
    } else if (col.type === "number") {
      if (value === null || value === undefined || value === "") {
        missingFields.push(col.headerName || col.field);
      }
    } else {
      if (value === null || value === undefined || value === "") {
        missingFields.push(col.headerName || col.field);
      }
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Complete los campos obligatorios: ${missingFields.join(", ")}`
    );
  }
}
