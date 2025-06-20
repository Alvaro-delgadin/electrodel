"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import {
  Button,
  createTheme,
  ThemeProvider,
  Tooltip,
  Modal,
  Box,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import customToolbar from "@/components/admin/productsToolbar.js";
import {
  Save,
  Cancel,
  Highlight,
  Image,
  Upload,
  Close,
} from "@mui/icons-material";
const customTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ec3237",
    },
    background: {
      default: "#202020",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&": {
            minWidth: "2.5rem",
            minHeight: "2.5rem",
            borderRadius: 30,
            color: "var(--font)",
          },
          "&:hover": {
            backgroundColor: "var(--background)", // hover global para botones
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        cell: {
          "&.MuiDataGrid-cell--editing": {
            backgroundColor: "var(--background)",
          },
        },
        row: {
          "&:hover": {
            backgroundColor: "var(--background-secondary)",
          },
          "&.noHover:hover": {
            backgroundColor: "transparent", // ← anula hover solo si tiene esta clase
          },
          "&.inactiveProduct": {
            color: "gray",
          },
        },
      },
    },
  },
  esES,
});

export default function ProductsTable() {
  const [loading, setLoading] = useState(true);
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const requestLock = useRef(false);
  const apiRef = useGridApiRef();
  const [rowsSelected, setRowsSelected] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedRowModal, setSelectedRowModal] = useState(null);
  const fileInputRef = useRef(null);

  const headerColumnsConfig = {
    product: {
      headerName: "Producto",
      type: "text",
      nullable: false,
    },
    price: { headerName: "Precio", type: "text", nullable: true },
    discount: {
      headerName: "Descuento (%)",
      type: "number",
      nullable: true,
    },
    stock: { headerName: "Stock", type: "number", nullable: false },
    active: { headerName: "Activo", type: "boolean", nullable: true },
    category: { headerName: "Categoría", type: "text", nullable: true },
    watts: { headerName: "Potencia (W)", type: "number", nullable: false },
    color: { headerName: "Color", type: "text", nullable: false },
    images: { headerName: "Imágenes", type: "text", nullable: true },
    created_at: {
      headerName: "Fecha de creación",
      type: "text",
      nullable: true,
      default: new Date().toISOString(),
      sortable: true,
    },
    id: { headerName: "id", type: "text", nullable: true },
  };

  const headerSpecialColumnsConfig = [
    {
      field: "actions",
      headerName: "",
      width: 100,
      renderCell: (params) =>
        params?.row?.isNew ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Button
              onClick={() => handleSaveNewRow(params.row)}
              style={{ cursor: "pointer" }}
            >
              <Save fontSize="small" />
            </Button>
            <Button
              style={{
                color: "var(--primary)",
                cursor: "pointer",
              }}
              onClick={() => handleCancelNewRow(params.row.id)}
            >
              <Cancel fontSize="small" />
            </Button>
          </div>
        ) : null,
      sortable: false,
      filterable: false,
    },
  ];

  const definedColumns = Object.entries(headerColumnsConfig).map(
    ([prop, key]) => {
      let column = {
        field: prop,
        headerName: key.headerName,
        type: key.type,
      };

      if (!["images", "id"].includes(prop)) {
        column.editable = true;
      }
      if (prop === "product") {
        column.width = 400;
      }
      if (["discount", "stock"].includes(prop)) {
        column.type = "number";
      }
      if ("price" === prop) {
        column.renderCell = (params) => {
          const value = Number(params.value);
          return isNaN(value)
            ? params.value
            : value.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 0,
              });
        };
      }
      if (prop === "images") {
        column.renderCell = (params) => {
          const images = params.value || [];
          const firstImage = images[0];

          return firstImage ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "5rem",
                height: "100%",
                backgroundColor: "var(--background-secondary)",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
              onClick={() => handleOpenImageModal(params.row)}
            >
              <img
                src={firstImage}
                alt="producto"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              />
            </div>
          ) : (
            <Button
              style={{ minWidth: "100%", minHeight: "100%" }}
              onClick={() => handleOpenImageModal(params.row)}
            >
              <Highlight
                sx={{
                  margin: "auto",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              />
            </Button>
          );
        };
      }
      return column;
    }
  );
  const columns = headerSpecialColumnsConfig?.length
    ? [...definedColumns, ...headerSpecialColumnsConfig]
    : definedColumns;

  useEffect(() => {
    const fetchData = async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("active", { ascending: false });
      if (!error) {
        setRows(products);
        setLoading(false);
      } else {
        setError(error.code);
      }
    };

    fetchData();
  }, []);

  const processRowUpdate = async (newRow, oldRow) => {
    setError(null);
    if (requestLock.current) return;
    if (newRow.isNew) {
      return { ...newRow };
    }

    try {
      setSync(true);
      requestLock.current = true;

      const changedField = Object.keys(newRow).find(
        (key) => newRow[key] !== oldRow[key]
      );

      if (!changedField) {
        setSync(false);
        return oldRow;
      }

      const updatedValue = newRow[changedField];
      const fieldConfig = headerColumnsConfig[changedField];

      // Validación: campo obligatorio no puede ser null o vacío
      if (
        fieldConfig &&
        fieldConfig.nullable === false &&
        (updatedValue === null ||
          updatedValue === undefined ||
          updatedValue === "")
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
      apiRef.current.updateRows([newRow]);
      // Actualizar en Supabase
      const { error } = await supabase
        .from("products")
        .update({ [changedField]: updatedValue })
        .eq("id", newRow.id);

      if (error) throw error;

      return newRow;
    } catch (err) {
      setError(err.message || "Error al actualizar");
      return oldRow;
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };

  const handleCancelNewRow = (id) => {
    setError(false);
    apiRef.current.updateRows([{ id, _action: "delete" }]);
  };

  const handleSaveNewRow = async (row) => {
    setError(false);
    const id = row.id;

    const requiredFields = Object.entries(headerColumnsConfig)
      .filter(([_, config]) => config.nullable === false)
      .map(([key]) => key);

    const missingFields = [];

    for (const field of requiredFields) {
      const value = row[field];
      const config = headerColumnsConfig[field];

      if (config.type === "string") {
        if (typeof value !== "string" || value.trim() === "") {
          missingFields.push(config.headerName || field);
        }
      } else if (config.type === "number") {
        if (value === null || value === undefined || value === "") {
          missingFields.push(config.headerName || field);
        }
      } else {
        if (value === null || value === undefined || value === "") {
          missingFields.push(config.headerName || field);
        }
      }
    }

    if (missingFields.length > 0) {
      setError(`Complete los campos obligatorios: ${missingFields.join(", ")}`);
      return;
    }

    // Validar campos numéricos negativos
    const negativeFields = Object.entries(headerColumnsConfig)
      .filter(([key, config]) => config.type === "number" && row[key] < 0)
      .map(([key]) => headerColumnsConfig[key].headerName || key);

    if (negativeFields.length > 0) {
      setError(
        `Los siguientes campos no pueden ser negativos: ${negativeFields.join(
          ", "
        )}`
      );
      return;
    }

    // Validar si ya existe un producto idéntico
    const isDuplicate = rows.some(
      (r) =>
        r.id !== id &&
        r.product === row.product &&
        r.watts === row.watts &&
        r.price === row.price &&
        r.stock === row.stock &&
        r.color === row.color
    );

    if (isDuplicate) {
      setError(
        "Ya existe un producto con los mismos valores (producto, watts, precio, stock y color)."
      );
      return;
    }

    if (requestLock.current) return;
    requestLock.current = true;
    apiRef.current.updateRows([{ id, _action: "delete" }]);
    try {
      setSync("Subiendo producto");
      const { id, isNew, ...newProduct } = row;

      newProduct.price = String(newProduct.price);
      newProduct.images = !newProduct.images ? [] : newProduct.images;

      const { error, data } = await supabase
        .from("products")
        .insert([newProduct])
        .select();

      if (error) throw error;

      const insertedRow = data?.[0];
      apiRef.current.updateRows([insertedRow]);
      if (!insertedRow)
        throw new Error("No se pudo obtener el producto creado.");
    } catch (err) {
      setError("Hubo un error al guardar el producto.");
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };

  const handleOpenImageModal = (row) => {
    setSelectedRowModal({
      ...row,
      images: Array.isArray(row.images) ? row.images : [],
    });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedRowModal(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = URL.createObjectURL(file);

    // Usar un índice que esté actualizado
    if (typeof fileInputRef.current.dataset.index !== "undefined") {
      const idx = parseInt(fileInputRef.current.dataset.index, 10);

      const updated = [...(selectedRowModal.images || [])];
      updated[idx] = uploadedUrl;

      setSelectedRowModal((prev) => {
        return { ...prev, images: updated };
      });
      apiRef.current.updateRows([{ id: selectedRowModal.id, images: updated }]);

      e.target.value = "";

      uploadImage(file, fileInputRef.current.dataset.index);
    }
  };
  const handleDeleteImage = async (e, index) => {
    e.stopPropagation(); // para que no dispare el click de upload
    if (requestLock.current) return;
    requestLock.current = true;

    setSync("Eliminando imagen");
    const updated = [...(selectedRowModal.images || [])];
    updated.splice(index, 1); // elimina la imagen
    apiRef.current.updateRows([{ id: selectedRowModal.id, images: updated }]);
    setSelectedRowModal((prev) => {
      return { ...prev, images: updated };
    });
    try {
      const { updateError } = await supabase
        .from("products")
        .update({ images: updated })
        .eq("id", selectedRowModal.id);
      if (updateError) throw new Error();
    } catch (err) {
      setError("Error al actualizar la imagen: " + err.message);
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };
  const uploadImage = async (file, index) => {
    if (!file || !index) return;
    if (requestLock.current) return;
    requestLock.current = true;
    setSync("Subiendo imagen");
    setError(false);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `product_${Date.now()}.${fileExt}`;
      const filePath = `product-image/${fileName}`;
      const { uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, file);
      if (uploadError) {
        throw new Error("Error al subir la imagen: " + uploadError.message);
      }
      setSync("Obteniendo url de la imagen");
      const { data, bucketError } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      if (bucketError) {
        throw new Error("Error al buscar la imagen: " + bucketError.message);
      }
      const updatedImages = [...selectedRowModal.images];
      updatedImages[index] = publicUrl;
      setSync("Actualizando Base de datos");
      const { updateError } = await supabase
        .from("products")
        .update({ images: updatedImages })
        .eq("id", selectedRowModal.id);
      if (updateError) {
        throw new Error(
          "Error al actualizar la imagen: " + updateError.message
        );
        setSync(false);
        return;
      }
    } catch (err) {
      setError(err);
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <div className="tableContainer">
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          apiRef={apiRef}
          rowHeight={80}
          sortModel={[{ field: "created_at", sort: "desc" }]}
          getRowClassName={(params) => {
            const classes = [];
            if (params.row.active === false) classes.push("inactiveProduct");
            if (params.row.isNew) classes.push("noHover");
            return classes.join(" ");
          }}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => setError(error.message)}
          checkboxSelection
          showToolbar
          disableRowSelectionOnClick
          disableVirtualization
          localeText={{
            ...esES.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: "Sin productos",
          }}
          isRowSelectable={(params) => !params.row.isNew}
          onRowSelectionModelChange={(newSelection) => {
            setRowsSelected(
              newSelection?.ids ? Array.from(newSelection.ids) : []
            );
          }}
          slots={{
            toolbar: customToolbar,
          }}
          slotProps={{
            toolbar: {
              sync,
              setSync,
              error,
              setError,
              rows,
              setRows,
              apiRef,
              rowsSelected,
              setRowsSelected,
              loading,
              columns,
              headerColumnsConfig,
              requestLock,
            },
          }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          disabled={sync}
        />
      </div>
      <Modal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        aria-labelledby="image-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "var(--background)",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            maxWidth: "30rem",
            width: "100%",
            height: "100%",
            maxHeight: "80vh",
            overflow: "auto",
            paddingTop: "3rem",
            position: "relative",
          }}
        >
          {selectedRowModal && (
            <>
              {/* Botón de cerrar */}
              <Tooltip title="Cerrar">
                <Button
                  onClick={handleCloseImageModal}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    margin: "0.5rem",
                  }}
                >
                  <Close />
                </Button>
              </Tooltip>

              <Typography id="modal-title" variant="h6" gutterBottom>
                Imágenes del producto
              </Typography>

              <Grid container spacing={2} direction="column">
                {(selectedRowModal.images?.length > 0
                  ? selectedRowModal.images
                  : [null]
                ).map((img, index) => (
                  <Grid
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "15rem",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Botón eliminar si hay imagen */}
                      {img && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteImage(e, index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "red",
                              "&:hover": {
                                bgcolor: "red",
                              },
                            }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip
                        title={img ? "Reemplazar imagen" : "Subir imagen"}
                      >
                        <Box
                          onClick={() => {
                            if (fileInputRef?.current) {
                              fileInputRef.current.dataset.index = index;
                              fileInputRef.current.click();
                            }
                          }}
                          sx={{
                            width: "100%",
                            minHeight: "10rem",
                            aspectRatio: "1 / 1",
                            border: "2px dashed #ccc",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                            "&:hover": {
                              borderColor: "#888",
                            },
                          }}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={`img-${index}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Upload fontSize="large" />
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box mt={2} textAlign="center">
                <Button
                  sx={{
                    backgroundColor: "var(--background-secondary)",
                    border: "none",
                  }}
                  variant="outlined"
                  onClick={() => {
                    setSelectedRowModal((prev) => ({
                      ...prev,
                      images: [...(prev.images || []), null],
                    }));
                  }}
                >
                  Agregar imagen
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </ThemeProvider>
  );
}
