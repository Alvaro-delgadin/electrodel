import styles from "./page.module.css";
import ProductsTable from "@/components/admin/productsTable";
export const metadata = {
  title: "Productos - Panel de administrador",
};
export default function Products() {
  return (
    <main className={styles.main}>
      <ProductsTable />
    </main>
  );
}
