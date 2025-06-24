"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { Tooltip } from "@mui/material";
import customToolbar from "@/components/admin/ordersToolbar.js";
import { Save, Cancel, Delete } from "@mui/icons-material";
import { createActions } from "@/lib/crud/crud";

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

  const columns = [
    {
      field: "client",
      headerName: "Cliente",
      type: "text",
      nullable: false,
      width: 200,
      editable: true,
    },
    {
      field: "created_at",
      headerName: "Fecha",
      type: "text",
      nullable: true,
      default: new Date().toISOString(),
      sortable: true,
      editable: false,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      field: "status",
      headerName: "Estado",
      type: "singleSelect",
      nullable: false,
      width: 120,
      editable: true,
      default: "pending",
      valueOptions: [
        { value: "pending", label: "🟡  Pendiente" },
        { value: "send", label: "🔵 Enviado" },
        { value: "finished", label: "🟢 Finalizado" },
      ],
    },
    {
      field: "total",
      headerName: "Envío",
      type: "number",
      nullable: false,
      editable: true,
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
    { field: "id", headerName: "id", type: "text", nullable: true },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      type: "actions",
      getActions: ({ id, row }) => {
        if (row.isNew) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                onClick={() => {
                  action.saveNewRow(row);
                }}
              />
            </Tooltip>,
            <Tooltip title="Cancelar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                onClick={() => action.cancelNewRow(id)}
              />
            </Tooltip>,
          ];
        }
        return [
          <Tooltip title="Eliminar">
            <GridActionsCellItem
              icon={<Delete />}
              label="Eliminar"
              onClick={() => action.deleteRow(id)}
            />
          </Tooltip>,
        ];
      },
      sortable: false,
      filterable: false,
    },
  ];

  const action = createActions(
    "orders",
    "pedido",
    supabase,
    apiRef,
    setSync,
    setError,
    requestLock,
    columns
  );

  return (
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
        processRowUpdate={action.rowUpdate}
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
            loading,
            sync,
            error,
            addRow: action.addRow,
          },
        }}
      />
    </div>
  );
}
