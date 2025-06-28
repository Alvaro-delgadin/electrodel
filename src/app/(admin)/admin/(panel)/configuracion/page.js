"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Status from "@/components/admin/Status";
import Image from "next/image";
import { Skeleton, Box, Button, Switch } from "@mui/material";

export default function Settings() {
  const [sync, setSync] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoPath, setLogoPath] = useState(null);
  const [logoFile, setLogoFile] = useState(undefined);
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [banner, setBanner] = useState({ active: false, message: "" });

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
        setSchedule(data.schedule);
        setFaqs(data.faqs || []);
        setBanner(data.banner || { active: false, message: "" });

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
    if (dataUpdatingRef.current) {
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

    if (data.schedule !== schedule) {
      setSync("Actualizando horario");
      const { error: updateError } = await supabase
        .from("settings")
        .update({ schedule: schedule })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar el horario" + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }
      setData((prev) => ({ ...prev, schedule: schedule }));
    }
    if (JSON.stringify(data.faqs || []) !== JSON.stringify(faqs)) {
      setSync("Actualizando preguntas frecuentes");
      const { error: updateError } = await supabase
        .from("settings")
        .update({ faqs })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError(
          "Error al actualizar preguntas frecuentes: " + updateError.code
        );
        dataUpdatingRef.current = false;
        return;
      }

      setData((prev) => ({ ...prev, faqs }));
    }
    if (JSON.stringify(data.banner || {}) !== JSON.stringify(banner)) {
      setSync("Actualizando banner promocional");
      const { error: updateError } = await supabase
        .from("settings")
        .update({ banner })
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar el banner: " + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }

      setData((prev) => ({ ...prev, banner }));
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
        <h1 className={styles.title}>Información del negocio</h1>
        <Status sync={sync} loading={loading} error={error} />
      </div>
      <h2 className={styles.inputTitle}>Logo</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{ borderRadius: "1rem", height: "10rem", width: "10rem" }}
        />
      ) : (
        <label className={styles.logoContainer}>
          {logoPath ? (
            <Image
              src={logoPath}
              className={styles.logo}
              alt=""
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
            />
          ) : (
            ""
          )}
          <input
            onChange={handleFileChange}
            type="file"
            className={styles.inputFile}
            accept="image/*"
            disabled={loading}
          />
        </label>
      )}
      <h2 className={styles.inputTitle}>WhatsApp</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{ width: "20rem", height: "3rem", borderRadius: "0.5rem" }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#303030",
            borderRadius: "0.5rem",
            pl: "1rem",
            gap: "0.5rem",
            fontSize: "1.1rem",
            maxWidth: "30rem",
          }}
        >
          +54
          <input
            id="whatsapp"
            onChange={(e) => setWhatsapp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e.target.value);
              }
            }}
            value={whatsapp}
            type="text"
            className={styles.inputText}
            style={{ paddingLeft: "0.5rem" }}
            disabled={loading}
          />
        </Box>
      )}
      <h2 className={styles.inputTitle}>Dirección</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{ width: "20rem", height: "3rem", borderRadius: "0.5rem" }}
        />
      ) : (
        <input
          id="location"
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e.target.value);
            }
          }}
          value={location}
          className={styles.inputText}
          type="text"
          disabled={loading}
        />
      )}
      <h2 className={styles.inputTitle}>Horario</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{ width: "20rem", height: "3rem", borderRadius: "0.5rem" }}
        />
      ) : (
        <input
          id="schedule"
          onChange={(e) => setSchedule(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e.target.value);
            }
          }}
          value={schedule}
          className={styles.inputText}
          type="text"
          disabled={loading}
        />
      )}
      <h2 className={styles.inputTitle}>Banner promocional</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{ width: "20rem", height: "3rem", borderRadius: "0.5rem" }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            bgcolor: "#303030",
            borderRadius: "0.5rem",
            p: "1rem",
            maxWidth: "30rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>Mostrar banner:</span>
            <Switch
              checked={banner.active}
              value={banner.active}
              onChange={(e) => {
                setBanner((prev) => ({ ...prev, active: e.target.checked }));
              }}
              color="primary"
            />
          </Box>
          <input
            placeholder="Mensaje del banner"
            type="text"
            value={banner.message}
            onChange={(e) =>
              setBanner((prev) => ({ ...prev, message: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e.target.value);
              }
            }}
            className={styles.inputText}
            style={{ backgroundColor: "var(--background)" }}
            disabled={loading}
          />
        </Box>
      )}
      <h2 className={styles.inputTitle}>Preguntas Frecuentes</h2>
      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{
            width: "20rem",
            height: "3rem",
            borderRadius: "0.5rem",
            mt: "1rem",
          }}
        />
      ) : (
        <Box
          sx={{
            bgcolor: "#303030",
            borderRadius: "0.5rem",
            p: "1rem",
            maxWidth: "30rem",
          }}
        >
          {faqs.map((faq, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                border: "1px solid #555",
                borderRadius: "0.5rem",
                padding: "0rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Pregunta"
                value={faq.question}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index].question = e.target.value;
                  setFaqs(updated);
                }}
                className={styles.inputText}
                style={{ backgroundColor: "var(--background)" }}
              />
              <textarea
                placeholder="Respuesta"
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index].answer = e.target.value;
                  setFaqs(updated);
                }}
                className={styles.inputText}
                style={{
                  minHeight: "4rem",
                  backgroundColor: "var(--background)",
                }}
              />
              <Button
                onClick={() => {
                  const updated = [...faqs];
                  updated.splice(index, 1);
                  setFaqs(updated);
                }}
                sx={{
                  alignSelf: "flex-end",
                  color: "#ec1000",
                  textTransform: "unset",
                  p: "0rem 0.5rem",
                  "&:hover": {
                    backgroundColor: "#ec3237",
                  },
                }}
              >
                Eliminar
              </Button>
            </Box>
          ))}
          <button
            onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
            className={styles.uploadBtn}
            style={{ width: "100%", maxWidth: "unset" }}
          >
            + Agregar pregunta y respuesta frecuente
          </button>
        </Box>
      )}

      {loading || dataUpdatingRef.current ? (
        <Skeleton
          variant="rounded"
          sx={{
            width: "20rem",
            height: "3rem",
            borderRadius: "0.5rem",
            mt: "1rem",
          }}
        />
      ) : (
        <button
          onClick={handleSubmit}
          className={`${styles.uploadBtn} ${error ? styles.error : ""}`}
          disabled={loading || dataUpdatingRef.current}
        >
          Guardar
        </button>
      )}
    </main>
  );
}
