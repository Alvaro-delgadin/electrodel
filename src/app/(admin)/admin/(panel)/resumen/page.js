"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Status from "@/components/admin/Status";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
registerLocale("es", es);

// ✅ Crea fechas en hora local
function getLocalRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

export default function Dashboard() {
  const [range, setRange] = useState(getLocalRange());
  const [startDate, endDate] = range;
  const [loading, setLoading] = useState(true);
  const [sync, setSync] = useState(true);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState(false);

  const fetchData = async (start, end) => {
    setSync(true);
    const startUTC = new Date(start).toISOString();
    const endUTC = new Date(end).toISOString();

    const [lowStock, sales, pendingOrders, finishedOrders] = await Promise.all([
      supabase
        .from("products")
        .select("images, product, stock")
        .lt("stock", 15)
        .eq("active", true)
        .order("stock", { ascending: true }),

      supabase
        .from("sales")
        .select("*")
        .gte("created_at", startUTC)
        .lte("created_at", endUTC),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("active", true),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "finished")
        .eq("active", true)
        .gte("created_at", startUTC)
        .lte("created_at", endUTC),
    ]);

    if (
      lowStock.error ||
      sales.error ||
      pendingOrders.error ||
      finishedOrders.error
    ) {
      setError("Error al cargar el resumen");
      setLoading(false);
      setSync(false);
      return;
    }

    let count = 0;
    let total = 0;
    if (sales?.data?.length) {
      count = sales.data.length;
      total = sales.data.reduce((acc, item) => acc + parseFloat(item.total), 0);
    }

    setSummary({
      lowStock: lowStock.data,
      sales: { count, total },
      pendingOrders: pendingOrders.count,
      finishedOrders: finishedOrders.count,
    });

    setLoading(false);
    setSync(false);
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <main className={styles.main}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Resumen</h1>
        <Status loading={loading} error={error} sync={sync} />
      </div>

      <div
        className={`${styles.datepickerContainer} ${loading ? "skeleton" : ""}`}
      >
        Fecha:
        {!loading ? (
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            disabled={loading}
            onChange={(update) => {
              if (update[0] && update[1]) {
                const start = new Date(update[0]);
                start.setHours(0, 0, 0, 0);
                const end = new Date(update[1]);
                end.setHours(23, 59, 59, 999);
                setRange([start, end]);
              } else {
                setRange(update);
              }
            }}
            isClearable
            placeholderText="Desde - Hasta"
            locale="es"
            maxDate={new Date()}
            className={`${styles.datepicker} ${loading ? "skeleton" : ""}`}
          />
        ) : (
          ""
        )}
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${loading ? "skeleton" : ""}`}>
          <h2>Facturado</h2>
          <p>
            {summary?.sales?.total
              ? new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                }).format(summary?.sales?.total)
              : "-"}
          </p>
        </div>

        <div className={`${styles.card} ${loading ? "skeleton" : ""}`}>
          <h2>Ventas</h2>
          <p>{summary?.sales?.count ?? "-"}</p>
        </div>

        <div className={`${styles.card} ${loading ? "skeleton" : ""}`}>
          <h2>Pedidos pendientes</h2>
          <p>{summary?.pendingOrders ?? "-"}</p>
        </div>

        <div className={`${styles.card} ${loading ? "skeleton" : ""}`}>
          <h2>Pedidos finalizados</h2>
          <p>{summary?.finishedOrders ?? "-"}</p>
        </div>
      </div>

      <h2>Productos con bajo stock</h2>
      <div className={styles.products}>
        {summary?.lowStock?.length
          ? summary.lowStock.map((prod, index) => (
              <div className={styles.product} key={index}>
                <div className={styles.imgContainer}>
                  {prod.images[0] && (
                    <img src={prod.images[0]} alt={prod.product} />
                  )}
                </div>
                <div className={styles.text}>
                  <h3>{prod.product}</h3>
                  <p>En stock: {prod.stock}</p>
                </div>
              </div>
            ))
          : !loading && "Sin alertas de stock por el momento."}
      </div>
    </main>
  );
}
