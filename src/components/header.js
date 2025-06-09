"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import styles from "@/styles/header.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Header() {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const getLogo = async () => {
      const { data } = await supabase.storage
        .from("assets")
        .getPublicUrl("logo transparent.webp");

      setLogoUrl(data.publicUrl);
    };

    getLogo();
  }, []);

  return (
    <header className={styles.header}>
      {logoUrl && <img src={logoUrl} alt="Logo" className={styles.logo} />}
    </header>
  );
}
