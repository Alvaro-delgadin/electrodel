export default function validateCellChange(fieldConfig, updatedValue) {
  if (
    fieldConfig &&
    fieldConfig.nullable === false &&
    (updatedValue === null || updatedValue === undefined || updatedValue === "")
  ) {
    throw new Error(
      `El campo "${fieldConfig.headerName}" no puede estar vacío.`
    );
  }

  if (fieldConfig && fieldConfig?.type === "number" && updatedValue < 0) {
    throw new Error(
      `El campo "${fieldConfig.headerName}" no puede ser negativo.`
    );
  }
}
