"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
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
} from "@mui/material";
import CustomToolbar from "@/components/admin/SalesToolbar.js";
import { MenuOpen } from "@mui/icons-material";
import formatPrice from "@/lib/client/formatters/formatPrice";
import { createActions } from "@/lib/crud/crud";
export default function SalesTable() {
  const [rows, setRows] = useState([]);
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const requestLock = useRef(false);
  const apiRef = useGridApiRef();
  const [saleItems, setSaleItems] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setRows(data);
      setLoading(false);
    } else {
      setError(error.code);
    }
  };
  async function handleOpenDrawer(row) {
    setSync(true);
    setDrawerOpen(true);
    setSelectedSaleId(row.id);

    const { data, error } = await supabase
      .from("sale_items")
      .select(
        `
    quantity,
    unit_price,
    discount,
      color,
      watts,
      ampere,
      voltage,
      product_name
  `
      )
      .eq("sale_id", row.id);

    if (error) {
      setError("Error al obtener productos de la venta:", error);
      setSync(false);
      return;
    }
    setSync(false);
    setSaleItems(data);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedSaleId(null);
    setSaleItems([]);
  }
  const columns = [
    {
      field: "showSale",
      headerName: "Ver venta",
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
      field: "customer_name",
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
      width: 150,
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
      field: "total",
      headerName: "Total",
      type: "number",
      nullable: false,
      editable: false,
      headerAlign: "left",
      align: "left",
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
      field: "payment_method",
      headerName: "Método de pago",
      type: "text",
      nullable: true,
      editable: false,
      width: 150,
    },
    {
      field: "whatsapp",
      headerName: "WhatsApp",
      type: "text",
      nullable: true,
      editable: true,
      width: 150,
    },
    {
      field: "mercadopago_id",
      headerName: "Id de Mercado Pago",
      type: "text",
      nullable: true,
      editable: false,
      width: 100,
    },
  ];

  const action = createActions(
    "sales",
    "venta",
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
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        loading={loading}
        sortModel={[{ field: "created_at", sort: "desc" }]}
        disableRowSelectionOnClick
        disableVirtualization
        processRowUpdate={action.rowUpdate}
        onProcessRowUpdateError={(error) => setError(error.message)}
        localeText={{
          ...esES.components.MuiDataGrid.defaultProps.localeText,
          noRowsLabel: "Sin ventas",
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
          },
        }}
      />
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <div style={{ width: 400, padding: 24 }}>
          <Typography variant="h6" gutterBottom>
            Productos de la venta
          </Typography>

          <Divider style={{ marginBottom: 16 }} />

          {!sync && saleItems.length ? (
            <List>
              {saleItems.map((item, index) => (
                <ListItem key={index} divider alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.product_name}
                    </Typography>
                    <Typography color="text.secondary">
                      Precio unitario: $ {formatPrice(item.unit_price)}
                    </Typography>
                    <Typography color="text.secondary">
                      Descuento: {item.discount}%
                    </Typography>
                    <Typography color="text.secondary">
                      Precio unitario con Descuento: ${" "}
                      {formatPrice(item.unit_price * (1 - item.discount / 100))}
                    </Typography>
                    <Typography color="text.secondary">
                      Cantidad: {item.quantity}
                    </Typography>
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
              ))}
            </List>
          ) : (
            ""
          )}
          {!sync && !saleItems.length ? (
            <Typography color="text.secondary">
              No se encontraron productos para esta venta.
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
