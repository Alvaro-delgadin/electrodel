import styles from "./page.module.css";
import OrdersTable from "@/components/admin/ordersTable";
export default function Orders() {
  return (
    <main className={styles.main}>
      <OrdersTable />
    </main>
  );
}
