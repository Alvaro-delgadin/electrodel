"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import {
  Button,
  Tooltip,
  Modal,
  Box,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import CustomToolbar from "@/components/admin/productsToolbar.js";
import {
  Save,
  Cancel,
  Image,
  Upload,
  Close,
  ContentCopy,
} from "@mui/icons-material";
import { createActions } from "@/lib/crud/crud";
import categories from "@/lib/productsCategories";

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

  const columns = [
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      type: "actions",
      getActions: ({ id, row }) => {
        if (row.isNew) {
          return [
            <Tooltip title="Guardar" key={1}>
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                onClick={() => {
                  action.saveNewRow(row);
                }}
              />
            </Tooltip>,
            <Tooltip title="Cancelar" key={2}>
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                onClick={() => action.cancelNewRow(id)}
              />
            </Tooltip>,
          ];
        }
        return [
          <Tooltip title="Duplicar" key={3}>
            <GridActionsCellItem
              icon={<ContentCopy />}
              label="Duplicar"
              onClick={() => action.addRow(row)}
            />
          </Tooltip>,
        ];
      },
      sortable: false,
      filterable: false,
    },
    {
      field: "product",
      headerName: "Producto",
      type: "text",
      nullable: false,
      width: 400,
      editable: true,
    },
    {
      field: "price",
      headerName: "Precio",
      type: "number",
      nullable: true,
      editable: true,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => {
        const value = Number(params.value);
        return isNaN(value)
          ? params.value
          : value.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
              minimumFractionDigits: 0,
            });
      },
    },
    {
      field: "discount",
      headerName: "Descuento (%)",
      type: "number",
      nullable: true,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "stock",
      headerName: "Stock",
      type: "number",
      nullable: false,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "active",
      headerName: "Activo",
      type: "boolean",
      nullable: true,
      editable: true,
    },
    {
      field: "category",
      headerName: "Categoría",
      type: "singleSelect",
      width: 250,
      valueOptions: categories.map((c) => c.category),
      nullable: true,
      editable: true,
    },
    {
      field: "subcategory",
      headerName: "Subcategoría",
      type: "singleSelect",
      width: 250,
      editable: true,
      nullable: true,
      // Devuelve las subcategorías válidas según la categoría seleccionada
      valueOptions: (params) => {
        const selectedCategory = params?.row?.category;
        const cat = categories.find((c) => c.category === selectedCategory);
        return cat ? cat.subcategories : [];
      },
      // Formatea el valor que se muestra en la celda (lectura)
      valueFormatter: (params) => {
        if (!params?.value || !params?.row?.category) return "";

        const cat = categories.find((c) => c.category === params.row.category);
        const validSubs = cat ? cat.subcategories : [];

        return validSubs.includes(params.value) ? params.value : "";
      },

      // Renderiza la celda manualmente por si querés más control visual
      renderCell: (params) => {
        const selectedCategory = params?.row?.category;
        const cat = categories.find((c) => c.category === selectedCategory);
        const validSubs = cat ? cat.subcategories : [];
        const value = validSubs.includes(params.value) ? params.value : "";
        return <span>{value}</span>;
      },
    },
    {
      field: "watts",
      headerName: "Potencia (W)",
      type: "number",
      align: "left",
      headerAlign: "left",
      editable: true,
      nullable: true,
    },
    {
      field: "ampere",
      headerName: "Corriente (A)",
      type: "text",
      nullable: true,
      editable: true,
    },
    {
      field: "color",
      headerName: "Color (luz)",
      type: "singleSelect",
      nullable: true,
      width: "150",
      editable: true,
      sortable: true,
      valueOptions: [
        { value: "Cálido", label: "🟠 Cálido" },
        { value: "Frío", label: "🔵 Frío" },
      ],
    },
    {
      field: "images",
      headerName: "Imágenes",
      type: "text",
      nullable: true,
      editable: false,
      renderCell: (params) => {
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
            <Image
              sx={{
                margin: "auto",
                fontSize: 20,
                cursor: "pointer",
              }}
            />
          </Button>
        );
      },
    },
    {
      field: "description",
      headerName: "Descripción",
      type: "text",
      nullable: true,
      editable: true,
      sortable: true,
      filterable: true,
    },
    {
      field: "created_at",
      headerName: "Fecha de creación",
      type: "text",
      nullable: true,
      editable: false,
      default: new Date().toISOString(),
      sortable: true,
    },
    {
      field: "id",
      headerName: "id",
      type: "text",
      nullable: true,
      editable: true,
    },
  ];

  const action = createActions(
    "products",
    "producto",
    supabase,
    apiRef,
    setSync,
    setError,
    requestLock,
    columns,
    rows,
    rowsSelected,
    selectedRowModal,
    setSelectedRowModal,
    categories
  );

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

  const handleImageChange = (e) => {
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

      e.target.value = "";

      action.uploadImage(file, fileInputRef.current.dataset.index);
    }
  };

  return (
    <>
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
          processRowUpdate={action.rowUpdate}
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
            toolbar: CustomToolbar,
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
              requestLock,
              addRow: action.addRow,
              setRowsValue: action.setRowsValue,
              importFile: action.importFile,
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
                      {img && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={(e) => action.deleteImage(e, index)}
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
    </>
  );
}
