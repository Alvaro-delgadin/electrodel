import styles from "./page.module.css";
import OrdersTable from "@/components/admin/ordersTable";

export const metadata = {
  title: "Pedidos - Panel de administrador",
};
export default function Orders() {
  return (
    <main className={styles.main}>
      <OrdersTable />
    </main>
  );
}
