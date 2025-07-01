import styles from "./page.module.css";
import ProductsTable from "@/components/admin/productsTable";
export default function Products() {
  return (
    <main className={styles.main}>
      <ProductsTable />
    </main>
  );
}
