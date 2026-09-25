"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import {
  Tooltip,
  Button,
  Drawer,
  Typography,
  List,
  ListItem,
  Divider,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import CustomToolbar from "@/components/admin/ordersToolbar.js";
import { Save, Cancel, Delete, MenuOpen, Storefront } from "@mui/icons-material";
import { createActions } from "@/lib/crud/crud";
import { isWholesaleClient, stripWholesalePrefix } from "@/lib/wholesale";

function formatARS(value) {
  const num = Number(value);
  return isNaN(num)
    ? value
    : num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      });
}

export default function OrdersTable() {
  const [rows, setRows] = useState([]);
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestLock = useRef(false);
  const apiRef = useGridApiRef();
  const channelRef = useRef(null);
  const isSubscribed = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [wholesaleFilter, setWholesaleFilter] = useState("all"); // "all" | "wholesale"

  useEffect(() => {
    fetchOrders();
    connectRealtime();

    return () => disconnectRealtime();
  }, []);

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
  const connectRealtime = () => {
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
  };
  const disconnectRealtime = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribed.current = false;
    }
  };
  async function handleOpenDrawer(row) {
    setSync(true);
    setDrawerOpen(true);
    setSelectedOrderId(row.id);

    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
    quantity,
      color,
      watts,
      ampere,
      voltage,
      product_name,
      unit_price,
      discount
  `
      )
      .eq("order_id", row.id);

    if (error) {
      console.error("Error al obtener productos del pedido:", error);
      setSync(false);
      return;
    }
    setSync(false);
    setOrderItems(data);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedOrderId(null);
    setOrderItems([]);
  }
  const columns = [
    {
      field: "showOrder",
      headerName: "Ver pedido",
      type: "text",
      nullable: true,
      width: 100,
      editable: false,

      headerAlign: "center",
      renderCell: (params) => {
        return (
          <Button
            style={{ minWidth: "100%", minHeight: "100%" }}
            onClick={() => handleOpenDrawer(params.row)}
          >
            <MenuOpen />
          </Button>
        );
      },
    },
    {
      field: "client",
      headerName: "Cliente",
      type: "text",
      nullable: false,
      width: 220,
      editable: true,
      renderCell: (params) => {
        const wholesale = isWholesaleClient(params.value);
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              height: "100%",
            }}
          >
            <span>{stripWholesalePrefix(params.value)}</span>
            {wholesale && (
              <Tooltip title="Pedido mayorista · sin pago online">
                <Chip
                  icon={<Storefront fontSize="small" />}
                  label="Mayorista"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Fecha",
      type: "text",
      nullable: true,
      width: 150,
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
      field: "subtotal",
      headerName: "Subtotal",
      type: "number",
      nullable: true,
      editable: false,
      headerAlign: "left",
      align: "left",
      description:
        "Subtotal de productos (con descuentos ya aplicados). No se edita a mano: se calcula al crear el pedido.",
      renderCell: (params) => {
        if (params.value === null || params.value === undefined) return "";
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
      field: "total",
      headerName: "Envío",
      type: "number",
      nullable: false,
      editable: true,
      headerAlign: "left",
      align: "left",
      description:
        "Costo de envío a completar a mano. El monto de productos está en la columna Subtotal.",
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
      field: "whatsapp",
      headerName: "WhatsApp",
      type: "text",
      nullable: true,
      width: 150,
    },
    {
      field: "address",
      headerName: "Dirección",
      type: "text",
      nullable: true,
      width: 150,
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
          <Tooltip title="Eliminar" key={3}>
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

  const wholesaleCount = rows.filter((row) =>
    isWholesaleClient(row.client)
  ).length;
  const displayedRows =
    wholesaleFilter === "wholesale"
      ? rows.filter((row) => isWholesaleClient(row.client))
      : rows;

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
        rows={displayedRows}
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
          toolbar: CustomToolbar,
        }}
        slotProps={{
          toolbar: {
            loading,
            sync,
            error,
            addRow: action.addRow,
            wholesaleFilter,
            onWholesaleFilterChange: setWholesaleFilter,
            wholesaleCount,
          },
        }}
      />
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <div style={{ width: 400, padding: 24 }}>
          <Typography variant="h6" gutterBottom>
            Productos del pedido
          </Typography>

          <Divider style={{ marginBottom: 16 }} />

          {!sync && orderItems.length ? (
            <>
              <List>
                {orderItems.map((item, index) => {
                  const hasPricing =
                    item.unit_price !== null && item.unit_price !== undefined;
                  const lineTotal = hasPricing
                    ? item.unit_price *
                      (1 - (item.discount || 0) / 100) *
                      item.quantity
                    : null;
                  return (
                    <ListItem key={index} divider alignItems="flex-start">
                      <Box sx={{ width: "100%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.product_name}
                          </Typography>
                          {hasPricing && (
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {formatARS(lineTotal)}
                            </Typography>
                          )}
                        </Box>
                        <Typography color="text.secondary">
                          Cantidad: {item.quantity}
                        </Typography>
                        {hasPricing && (
                          <Typography color="text.secondary">
                            Precio unitario: {formatARS(item.unit_price)}
                            {item.discount > 0
                              ? ` · Descuento: ${item.discount}%`
                              : ""}
                          </Typography>
                        )}
                        {item.color && (
                          <Typography color="text.secondary">
                            Color: {item.color}
                          </Typography>
                        )}
                        {item.ampere && (
                          <Typography color="text.secondary">
                            Corriente (A): {item.ampere}
                          </Typography>
                        )}
                        {item.voltage && (
                          <Typography color="text.secondary">
                            Tensión (V): {item.voltage}
                          </Typography>
                        )}
                        {item.watts && (
                          <Typography color="text.secondary">
                            Potencia: {item.watts}W
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
              {orderItems.every(
                (item) => item.unit_price !== null && item.unit_price !== undefined
              ) ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography fontWeight="bold">Total productos</Typography>
                  <Typography fontWeight="bold">
                    {formatARS(
                      orderItems.reduce(
                        (acc, item) =>
                          acc +
                          item.unit_price *
                            (1 - (item.discount || 0) / 100) *
                            item.quantity,
                        0
                      )
                    )}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Este pedido no tiene precio guardado por ítem (es anterior a
                  esta función).
                </Typography>
              )}
            </>
          ) : (
            ""
          )}
          {!sync && !orderItems.length ? (
            <Typography color="text.secondary">
              No se encontraron productos para este pedido.
            </Typography>
          ) : (
            ""
          )}
          {sync ? <CircularProgress size={20} sx={{ m: "2rem" }} /> : ""}
        </div>
      </Drawer>
    </div>
  );
}
