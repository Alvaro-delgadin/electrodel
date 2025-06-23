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
import exportToExcel from "@/lib/export";
import { importExcelFile } from "@/lib/import";

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

export default function customToolbar({
  sync,
  setSync,
  error,
  setError,
  rows,
  setRows,
  apiRef,
  rowsSelected,
  loading,
  columns,
  headerColumnsConfig,
  requestLock,
  handleAddRow,
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuTriggerRef = useRef(null);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const importMenuTriggerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleActive = async (value) => {
    if (requestLock.current) return;
    requestLock.current = true;
    setSync(true);
    setError(false);

    rowsSelected.forEach((rowId) => {
      apiRef.current.updateRows([{ id: rowId, active: value }]);
    });
    const updates = rowsSelected.map((id) =>
      supabase.from("products").update({ active: value }).eq("id", id)
    );
    try {
      const results = await Promise.all(updates);
      const hasError = results.some((res) => res.error);
      if (hasError) {
        throw new Error("Error actualizando algunos registros");
      }
    } catch (error) {
      setError(error);
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    setError(false);
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setError("Formato no válido. Usá un archivo Excel o csv (.xlsx, .xls)");
      setSync(false);
      return;
    }

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      try {
        setSync("Importando archivo Excel");
        const importedRows = await importExcelFile(file, headerColumnsConfig);
        const rowsToUpdate = importedRows.filter((importedRow) =>
          rows.some(
            (existingRow) => existingRow.product === importedRow.product
          )
        );
        if (rowsToUpdate?.length) {
          const formatedUpdateRows = rowsToUpdate.map(({ id, ...rest }) => ({
            ...rest,
            price: String(rest.price),
          }));
          const updates = formatedUpdateRows.map((row) =>
            supabase.from("products").update(row).eq("product", row.product)
          );
          setSync("Actualizando base de datos");
          const { error: updateError } = await Promise.all(updates);
          if (updateError) {
            throw new Error("Error al actualizar base de datos");
          }
        }
        const newRows = importedRows.filter(
          (importedRow) =>
            !rows.some(
              (existingRow) => existingRow.product === importedRow.product
            )
        );

        if (newRows?.length) {
          setSync("Subiendo los nuevos productos");
          const formatedNewRows = newRows.map(({ id, ...rest }) => ({
            ...rest,
            price: String(rest.price),
          }));

          const { error: uploadError } = await supabase
            .from("products")
            .insert(formatedNewRows);

          if (uploadError) {
            throw new Error("Error al agregar productos a la base de datos");
          }
        }
      } catch (err) {
        setError(err.message);
        setSync(false);
      }
    }
    setSync("Obteniendo productos actualizados");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      setSync(false);
      setError("Error al obtener productos:", error.message);
      return;
    }
    setRows(data);
    setSync(false);
    e.target.value = null;
    return;
  };
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
            <ToolbarButton onClick={() => handleActive(false)}>
              <Clear fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        ) : (
          ""
        )}
        {rowsSelected?.length ? (
          <Tooltip title="Activar productos">
            <ToolbarButton onClick={() => handleActive(true)}>
              <Check fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        ) : (
          ""
        )}

        <Tooltip title="Añadir producto">
          <ToolbarButton onClick={handleAddRow}>
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
              fileInputRef.current.click();
            }}
          >
            Importar Excel
          </MenuItem>
        </Menu>

        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          onChange={handleImport}
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
