import { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { supabase } from "@/lib/supabaseClient";
import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from "@mui/x-data-grid";
import {
  Typography,
  InputAdornment,
  TextField,
  Divider,
  MenuItem,
  Tooltip,
  Menu,
  Badge,
  Box,
} from "@mui/material";
import {
  Search,
  Cancel,
  Upload,
  Add,
  Check,
  Clear,
  ViewColumn,
  FilterList,
  FileDownload,
} from "@mui/icons-material";
import Status from "@/components/admin/Status";

const StyledQuickFilter = styled(QuickFilter)({
  display: "grid",
  alignItems: "center",
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  width: "min-content",
  height: "min-content",
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? "none" : "auto",
  transition: theme.transitions.create(["opacity"]),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  overflowX: "clip",
  width: ownerState.expanded ? 260 : "var(--trigger-width)",
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(["width", "opacity"]),
}));
import exportToExcel from "@/lib/excel/export";

export default function customToolbar({
  loading,
  sync,
  error,
  rows,
  rowsSelected,
  columns,
  addRow,
  setRowsValue,
  importFile,
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuTriggerRef = useRef(null);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const importMenuTriggerRef = useRef(null);
  const fileImportInputRef = useRef(null);

  return (
    <Toolbar
      sx={{
        display: "flex",
        flexWrap: "wrap",
        minHeight: "auto",
      }}
    >
      <Typography
        fontWeight="bold"
        fontSize="x-large"
        sx={{
          display: "flex",
          flex: 1,
          mx: 0.5,
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        Productos
        <Status sync={sync} error={error} loading={loading} />
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        {rowsSelected?.length ? (
          <Tooltip title="Desactivar productos">
            <ToolbarButton onClick={() => setRowsValue("active", false)}>
              <Clear fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        ) : (
          ""
        )}
        {rowsSelected?.length ? (
          <Tooltip title="Activar productos">
            <ToolbarButton onClick={() => setRowsValue("active", true)}>
              <Check fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        ) : (
          ""
        )}

        <Tooltip title="Añadir producto">
          <ToolbarButton onClick={addRow}>
            <Add fontSize="small" />
          </ToolbarButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          variant="medio"
          flexItem
          sx={{ mx: 0.5 }}
        />

        <Tooltip title="Columnas">
          <ColumnsPanelTrigger render={<ToolbarButton />}>
            <ViewColumn fontSize="small" />
          </ColumnsPanelTrigger>
        </Tooltip>

        <Tooltip title="Filtros">
          <FilterPanelTrigger
            render={(props, state) => (
              <ToolbarButton {...props} color="default">
                <Badge
                  badgeContent={state.filterCount}
                  color="primary"
                  variant="dot"
                >
                  <FilterList fontSize="small" />
                </Badge>
              </ToolbarButton>
            )}
          />
        </Tooltip>

        <Divider
          orientation="vertical"
          variant="medio"
          flexItem
          sx={{ mx: 0.5 }}
        />
        <Tooltip title="Exportar">
          <ToolbarButton
            ref={exportMenuTriggerRef}
            id="export-menu-trigger"
            aria-controls="export-menu"
            aria-haspopup="true"
            aria-expanded={exportMenuOpen ? "true" : undefined}
            onClick={() => setExportMenuOpen(true)}
          >
            <FileDownload fontSize="small" />
          </ToolbarButton>
        </Tooltip>

        <Menu
          id="export-menu"
          anchorEl={exportMenuTriggerRef.current}
          open={exportMenuOpen}
          onClose={() => setExportMenuOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            list: {
              "aria-labelledby": "export-menu-trigger",
            },
          }}
        >
          <ExportPrint
            render={<MenuItem />}
            onClick={() => setExportMenuOpen(false)}
          >
            Imprimir
          </ExportPrint>
          <ExportCsv
            render={<MenuItem />}
            onClick={() => setExportMenuOpen(false)}
          >
            Descargar como CSV
          </ExportCsv>
          <MenuItem
            onClick={() => {
              setExportMenuOpen(false);
              exportToExcel(rows, columns, "Productos.xlsx");
            }}
          >
            Descargar como Excel
          </MenuItem>
        </Menu>

        <Tooltip title="Importar">
          <ToolbarButton
            ref={importMenuTriggerRef}
            id="import-menu-trigger"
            aria-controls="import-menu"
            aria-haspopup="true"
            aria-expanded={importMenuOpen ? "true" : undefined}
            onClick={() => setImportMenuOpen(true)}
          >
            <Upload fontSize="small" />
          </ToolbarButton>
        </Tooltip>

        <Menu
          id="import-menu"
          anchorEl={importMenuTriggerRef.current}
          open={importMenuOpen}
          onClose={() => setImportMenuOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            list: {
              "aria-labelledby": "import-menu-trigger",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setImportMenuOpen(false);
              fileImportInputRef.current.click();
            }}
          >
            Importar Excel
          </MenuItem>
        </Menu>

        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileImportInputRef}
          onChange={importFile}
          style={{ display: "none" }}
          disabled={sync}
        />
        <StyledQuickFilter>
          <QuickFilterTrigger
            render={(triggerProps, state) => (
              <Tooltip title="Buscar" enterDelay={0}>
                <StyledToolbarButton
                  {...triggerProps}
                  ownerState={{ expanded: state.expanded }}
                  color="default"
                  aria-disabled={state.expanded}
                >
                  <Search fontSize="small" />
                </StyledToolbarButton>
              </Tooltip>
            )}
          />
          <QuickFilterControl
            render={({ ref, ...controlProps }, state) => (
              <StyledTextField
                {...controlProps}
                ownerState={{ expanded: state.expanded }}
                inputRef={ref}
                aria-label="Buscar"
                placeholder="Buscar..."
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: state.value ? (
                      <InputAdornment position="end">
                        <QuickFilterClear
                          edge="end"
                          size="small"
                          aria-label="Limpiar búsqueda"
                          material={{ sx: { marginRight: -0.75 } }}
                        >
                          <Cancel fontSize="small" />
                        </QuickFilterClear>
                      </InputAdornment>
                    ) : null,
                    ...controlProps.slotProps?.input,
                  },
                  ...controlProps.slotProps,
                }}
              />
            )}
          />
        </StyledQuickFilter>
      </Box>
    </Toolbar>
  );
}
