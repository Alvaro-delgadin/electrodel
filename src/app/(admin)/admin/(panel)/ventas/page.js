import styles from "./page.module.css";
import SalesTable from "@/components/admin/SalesTable";
export default function Sales() {
  return (
    <main className={styles.main}>
      <SalesTable />
    </main>
  );
}
