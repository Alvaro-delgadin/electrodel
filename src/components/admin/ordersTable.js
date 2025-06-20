"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider, Select, MenuItem } from "@mui/material";
import customToolbar from "@/components/admin/ordersToolbar.js";
import { Save, Cancel, Delete } from "@mui/icons-material";
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
            color: "black",
          },
        },
      },
    },
  },
  esES,
});

export default function OrdersTable() {
  const [rows, setRows] = useState([]);
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestLock = useRef(false);
  const apiRef = useGridApiRef();
  const channelRef = useRef(null);
  const isSubscribed = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (data) {
        setRows(data);
        setLoading(false);
      } else {
        setError(error.code);
      }
    };

    fetchOrders();

    if (isSubscribed.current) return;

    const channel = supabase
      .channel("orders-inserts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          apiRef.current.updateRows([payload.new]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    isSubscribed.current = true;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribed.current = false;
      }
    };
  }, []);
  const headerColumnsConfig = {
    client: {
      headerName: "Cliente",
      type: "text",
      nullable: false,
    },
    created_at: {
      headerName: "Fecha",
      type: "text",
      nullable: true,
      default: new Date().toISOString(),
      sortable: true,
    },
    status: {
      headerName: "Estado",
      type: "text",
      nullable: false,
      default: "pending",
    },
    total: {
      headerName: "Envío",
      type: "number",
      nullable: false,
    },
    id: { headerName: "id", type: "text", nullable: true },
  };

  const headerSpecialColumnsConfig = [
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      type: "actions",
      getActions: ({ id, row }) => {
        if (row.isNew) {
          return [
            <GridActionsCellItem
              icon={<Save />}
              label="Guardar"
              onClick={() => {
                handleSaveNewRow(row);
              }}
            />,
            <GridActionsCellItem
              icon={<Cancel />}
              label="Cancelar"
              onClick={() => handleCancelNewRow(id)}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<Delete />}
            label="Eliminar"
            onClick={() => handleDeleteRow(id)}
          />,
        ];
      },
    },
  ];
  const definedColumns = Object.entries(headerColumnsConfig).map(
    ([prop, key]) => {
      let column = {
        field: prop,
        headerName: key.headerName,
        type: key.type,
        editable: true,
      };

      if (prop === "client") {
        column.width = 200;
      }
      if (["created_at"].includes(prop)) {
        column.editable = false;
      }
      if ("total" === prop) {
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
      if ("created_at" === prop) {
        column.renderCell = (params) => {
          const date = new Date(params.value);
          return date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };
      }
      if (prop === "status") {
        column.width = 120;
        column.renderCell = (params) => {
          const map = {
            pending: "🟡 Pendiente",
            send: "🔵 Enviado",
            finished: "🟢 Finalizado",
          };
          return map[params.value] || params.value;
        };
        column.renderEditCell = (params) => (
          <Select
            value={params.value || ""}
            onChange={(event) => {
              params.api.setEditCellValue(
                {
                  id: params.id,
                  field: params.field,
                  value: event.target.value,
                },
                event
              );
            }}
            fullWidth
            autoFocus
          >
            <MenuItem value="pending">🟡 Pendiente</MenuItem>
            <MenuItem value="send">🔵 Enviado</MenuItem>
            <MenuItem value="finished">🟢 Finalizado</MenuItem>
          </Select>
        );
      }
      return column;
    }
  );
  const columns = headerSpecialColumnsConfig?.length
    ? [...definedColumns, ...headerSpecialColumnsConfig]
    : definedColumns;

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
      // Actualizar en Supabase
      apiRef.current.updateRows([newRow]);
      const { error } = await supabase
        .from("orders")
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

    if (requestLock.current) return;
    requestLock.current = true;
    try {
      setSync("Subiendo nuevo pedido");
      apiRef.current.updateRows([{ id, _action: "delete" }]);
      const { id, isNew, created_at, ...newProduct } = row;

      const { error, data } = await supabase
        .from("orders")
        .insert([newProduct])
        .select();

      if (error) throw error;

      const insertedRow = data?.[0];
      if (!insertedRow) throw new Error("No se pudo obtener el pedido creado");
    } catch (err) {
      setError("Hubo un error al guardar el pedido");
    } finally {
      setSync(false);
      requestLock.current = false;
    }
  };

  const handleDeleteRow = async (id) => {
    setError(null);
    if (requestLock.current) return;
    requestLock.current = true;
    try {
      setSync(true);
      // Actualizar en Supabase
      apiRef.current.updateRows([{ id, _action: "delete" }]);
      const { error } = await supabase
        .from("orders")
        .update({ active: false })
        .eq("id", id);
      if (error) throw error;
      return;
    } catch (err) {
      setError(err.message || "Error al actualizar");
      return oldRow;
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
          apiRef={apiRef}
          columns={columns}
          loading={loading}
          sortModel={[{ field: "created_at", sort: "desc" }]}
          getRowClassName={(params) => {
            const classes = [];
            if (params.row.isNew) classes.push("noHover");
            return classes.join(" ");
          }}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => setError(error.message)}
          disableRowSelectionOnClick
          disableVirtualization
          localeText={{
            ...esES.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: "Sin pedidos",
          }}
          showToolbar
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
              loading,
              columns,
              headerColumnsConfig,
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}
