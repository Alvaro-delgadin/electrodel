import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Sitio en construcción</h1>
      <p className={styles.text}>
        Estamos trabajando para traerte algo{" "}
        <span className={styles.highlight}>increíble</span>.
      </p>
    </main>
  );
}
