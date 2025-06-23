import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import { Padding, Search } from "@mui/icons-material";

export default function SearchBar({ onChange }) {
  return (
    <TextField
      variant="outlined"
      placeholder="¿Qué estás buscando?"
      onChange={onChange}
      size="small"
      fullWidth
      slotProps={{
        input: {
          sx: {
            padding: 0,
          },
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Buscar">
                <IconButton>
                  <Search />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
