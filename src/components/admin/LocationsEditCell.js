"use client";
import { Autocomplete, TextField } from "@mui/material";
import { useGridApiContext } from "@mui/x-data-grid";

// Celda editable custom para DataGrid: permite elegir varias zonas
// de entrega para un producto, a partir de la lista de zonas activas.
export default function LocationsEditCell(params) {
  const apiRef = useGridApiContext();
  const { id, field, value, options } = params;

  return (
    <Autocomplete
      multiple
      autoFocus
      openOnFocus
      options={options}
      value={value || []}
      onChange={(_, newValue) => {
        apiRef.current.setEditCellValue({ id, field, value: newValue });
      }}
      renderInput={(inputParams) => (
        <TextField {...inputParams} variant="standard" />
      )}
      sx={{ width: "100%", px: 1 }}
      size="small"
    />
  );
}
