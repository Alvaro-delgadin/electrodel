"use client";
import styles from "@/styles/admin/sidebar.module.css";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient.js";
import { useEffect, useState } from "react";
import { useLogout } from "@/lib/logout";
export default function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const [logo, setLogo] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      setTimeout(() => {
        if (loading) {
          setOffline(true);
          setLoading(false);
        }
      }, 10000);
      const { data, error } = await supabase
        .from("settings")
        .select("logo")
        .single();
      if (!error) {
        setLogo(data?.logo);
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div
        className={`${styles.logoContainer} ${
          loading && !offline ? "skeleton" : ""
        }`}
      >
        {logo ? <img src={logo} alt="Logo" className={styles.logo} /> : ""}
      </div>
      <nav className={styles.navbar}>
        {NAV_ITEMS.map((item, index) => (
          <Link
            href={item.href}
            className={`${styles.navItem} ${
              pathname.startsWith(item.href) ? styles.active : ""
            }`}
            key={index}
          >
            <img src={item.icon} className={styles.icon} />
            <p className={styles.label}>{item.label}</p>
          </Link>
        ))}
        <button className={styles.logout} onClick={logout}>
          <img className={styles.icon} src="/icons/logout.svg" />
          <p className={styles.label}>Cerrar sesión</p>
        </button>
      </nav>
    </aside>
  );
}
