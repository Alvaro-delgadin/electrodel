import styles from "./page.module.css";
import SalesTable from "@/components/admin/SalesTable";
export const metadata = {
  title: "Ventas - Panel de administrador",
};
export default function Sales() {
  return (
    <main className={styles.main}>
      <SalesTable />
    </main>
  );
}
