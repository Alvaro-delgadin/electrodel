import styles from "@/styles/header.module.css";

const logoUrl =
  "https://pbmvrjvjhablmelovyoc.supabase.co/storage/v1/object/public/assets//logo%20transparent.webp";
export default function Header() {
  return (
    <header className={styles.header}>
      {logoUrl && <img src={logoUrl} alt="Logo" className={styles.logo} />}
    </header>
  );
}
