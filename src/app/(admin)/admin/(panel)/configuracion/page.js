"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Status from "@/components/admin/Status";

export default function Settings() {
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoPath, setLogoPath] = useState(undefined);
  const [logoFile, setLogoFile] = useState(undefined);
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [data, setData] = useState(undefined);
  const rowId = "45645c26-d123-42a1-aa25-9d5a0bf52f33";
  const dataUpdatingRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (!error) {
        setData(data);
        setLogoPath(data.logo);
        setWhatsapp(data.whatsapp);
        setLocation(data.location);
        setLoading(false);
      } else {
        setError(error.code);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!dataUpdatingRef.current) return;
    const timeout = setTimeout(() => {
      dataUpdatingRef.current = false;
    }, 100); // margen de seguridad
    return () => clearTimeout(timeout);
  }, [data]);

  const handleSubmit = async () => {
    if (!logoFile && data.whatsapp === whatsapp && data.location === location) {
      return;
    }

    setError(null);
    dataUpdatingRef.current = true;
    if (logoFile) {
      setSync("Subiendo logo");

      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, logoFile);

      if (uploadError) {
        setSync(false);
        setError("Error al subir el logo: " + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }
      setSync("Actualizando logo");
      const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const { error: updateError } = await supabase
        .from("settings")
        .update({ logo: publicUrl })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar el logo: " + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }
      setLogoFile(undefined);
      setData((prev) => ({ ...prev, logo: filePath }));
    }

    if (data.whatsapp !== whatsapp) {
      setSync("Actualizando whatsapp");
      const { error: updateError } = await supabase
        .from("settings")
        .update({ whatsapp: whatsapp })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar WhatsApp" + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }

      setData((prev) => ({ ...prev, whatsapp: whatsapp }));
    }

    if (data.location !== location) {
      setSync("Actualizando dirección");
      const { error: updateError } = await supabase
        .from("settings")
        .update({ location: location })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar la dirección" + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }
      setData((prev) => ({ ...prev, location: location }));
    }
    setSync(false);
    dataUpdatingRef.current = false;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
      setLogoPath(URL.createObjectURL(file));
    } else {
      setError("Solo se permiten imágenes");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Configuración</h1>
        <Status sync={sync} loading={loading} error={error} />
      </div>
      <h2 className={styles.inputTitle}>Logo</h2>
      <label
        className={`${!loading ? styles.logoContainer : ""} ${
          loading ? "skeleton" : ""
        }`}
      >
        <img src={logoPath} className={styles.logo} />
        <input
          onChange={handleFileChange}
          type="file"
          className={styles.inputFile}
          accept="image/*"
          disabled={loading}
        />
      </label>
      <h2 className={styles.inputTitle}>WhatsApp</h2>
      <div className={loading ? "skeleton" : ""}>
        <input
          id="whatsapp"
          onChange={(e) => setWhatsapp(e.target.value)}
          value={whatsapp}
          type="text"
          className={styles.inputText}
          disabled={loading}
        />
      </div>
      <h2 className={styles.inputTitle}>Dirección</h2>
      <div className={loading ? "skeleton" : ""}>
        <input
          id="location"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
          className={styles.inputText}
          type="text"
          disabled={loading}
        />
      </div>
      <button
        onClick={handleSubmit}
        className={`${styles.uploadBtn} ${error ? styles.error : ""} ${
          loading || dataUpdatingRef.current ? "skeleton" : ""
        }`}
        disabled={loading || dataUpdatingRef.current}
      >
        Guardar
      </button>
    </main>
  );
}
