"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Status from "@/components/admin/Status";
import Image from "next/image";
import { Skeleton, Box, Button, Switch, IconButton } from "@mui/material";
import { Cancel, Upload } from "@mui/icons-material";

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
  const [bannerImage, setBannerImage] = useState({ active: false, images: [] });

  const [data, setData] = useState(undefined);
  const rowId = "45645c26-d123-42a1-aa25-9d5a0bf52f33";
  const dataUpdatingRef = useRef(false);
  const bannerImageInputRef = useRef(null);

  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [locationsLoading, setLocationsLoading] = useState(true);

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
        setBannerImage(data.banner_image || { active: false, images: [] });

        setLoading(false);
      } else {
        setError(error.code);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });
      if (!error) setLocations(data || []);
      setLocationsLoading(false);
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!dataUpdatingRef.current) return;
    const timeout = setTimeout(() => {
      dataUpdatingRef.current = false;
    }, 100); // margen de seguridad
    return () => clearTimeout(timeout);
  }, [data]);

  const handleSubmit = async (updatedFields = {}) => {
    if (dataUpdatingRef.current) return;

    setError(null);
    dataUpdatingRef.current = true;

    const updates = {};

    // Whatsapp
    const newWhatsapp = updatedFields.whatsapp ?? whatsapp;
    if (data.whatsapp !== newWhatsapp) {
      updates.whatsapp = newWhatsapp;
    }

    // Location
    const newLocation = updatedFields.location ?? location;
    if (data.location !== newLocation) {
      updates.location = newLocation;
    }

    // Schedule
    const newSchedule = updatedFields.schedule ?? schedule;
    if (data.schedule !== newSchedule) {
      updates.schedule = newSchedule;
    }

    // Faqs
    const newFaqs = updatedFields.faqs ?? faqs;
    if (JSON.stringify(data.faqs || []) !== JSON.stringify(newFaqs)) {
      updates.faqs = newFaqs;
    }

    // Banner (texto)
    if (
      "banner" in updatedFields
        ? JSON.stringify(data.banner || {}) !==
          JSON.stringify(updatedFields.banner)
        : JSON.stringify(data.banner || {}) !== JSON.stringify(banner)
    ) {
      updates.banner = updatedFields.banner ?? banner;
    }

    // Banner (imagen)
    if (
      "bannerImage" in updatedFields
        ? JSON.stringify(data.banner_image || {}) !==
          JSON.stringify(updatedFields.bannerImage)
        : JSON.stringify(data.banner_image || {}) !== JSON.stringify(bannerImage)
    ) {
      updates.banner_image = updatedFields.bannerImage ?? bannerImage;
    }

    // Subida de logo
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
        setError("Error al subir el logo: " + uploadError.code);
        dataUpdatingRef.current = false;
        return;
      }

      setSync("Actualizando logo");
      const { data: urlData } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      updates.logo = publicUrl;
      setLogoFile(undefined);
    }

    const keys = Object.keys(updates);
    if (keys.length > 0) {
      setSync("Actualizando datos...");
      const { error: updateError } = await supabase
        .from("settings")
        .update(updates)
        .eq("id", rowId);

      if (updateError) {
        setSync(false);
        setError("Error al actualizar: " + updateError.code);
        dataUpdatingRef.current = false;
        return;
      }

      setData((prev) => ({ ...prev, ...updates }));
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

  // Abre el selector de archivos para agregar (index undefined) o reemplazar
  // (index puntual) una imagen del banner de imagen.
  const handleBannerImageClick = (index) => {
    if (bannerImageInputRef.current) {
      bannerImageInputRef.current.dataset.index =
        index === undefined ? "" : index;
      bannerImageInputRef.current.click();
    }
  };

  const handleBannerImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      e.target.value = "";
      return;
    }

    const indexAttr = bannerImageInputRef.current?.dataset.index;
    const index =
      indexAttr !== "" && indexAttr !== undefined
        ? parseInt(indexAttr, 10)
        : null;
    e.target.value = "";

    setSync("Subiendo imagen del banner");

    const fileExt = file.name.split(".").pop();
    const fileName = `banner_${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, file);

    if (uploadError) {
      setSync(false);
      setError("Error al subir la imagen: " + uploadError.code);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("assets")
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const updatedImages = [...bannerImage.images];
    if (index !== null && index < updatedImages.length) {
      updatedImages[index] = publicUrl;
    } else {
      updatedImages.push(publicUrl);
    }

    const updated = { ...bannerImage, images: updatedImages };
    setBannerImage(updated);
    await handleSubmit({ bannerImage: updated });
  };

  const handleDeleteBannerImage = async (e, index) => {
    e.stopPropagation();
    const updatedImages = bannerImage.images.filter((_, i) => i !== index);
    const updated = { ...bannerImage, images: updatedImages };
    setBannerImage(updated);
    await handleSubmit({ bannerImage: updated });
  };

  const handleAddLocation = async () => {
    const name = newLocationName.trim();
    if (!name) return;
    setSync("Agregando zona");
    const { data: inserted, error } = await supabase
      .from("locations")
      .insert([{ name, active: true }])
      .select();

    if (error) {
      setSync(false);
      setError("Error al agregar zona: " + error.code);
      return;
    }

    setLocations((prev) =>
      [...prev, inserted[0]].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewLocationName("");
    setSync(false);
  };

  const handleToggleLocationActive = async (loc) => {
    setSync("Actualizando zona");
    const { error } = await supabase
      .from("locations")
      .update({ active: !loc.active })
      .eq("id", loc.id);

    if (error) {
      setSync(false);
      setError("Error al actualizar zona: " + error.code);
      return;
    }

    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, active: !l.active } : l))
    );
    setSync(false);
  };

  const handleDeleteLocation = async (loc) => {
    setSync("Eliminando zona");
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", loc.id);

    if (error) {
      setSync(false);
      setError("Error al eliminar zona: " + error.code);
      return;
    }

    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
    setSync(false);
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
                handleSubmit({ whatsapp: e.target.value });
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
              handleSubmit({ location: e.target.value });
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
              handleSubmit({ schedule: e.target.value });
            }
          }}
          value={schedule}
          className={styles.inputText}
          type="text"
          disabled={loading}
        />
      )}
      <h2 className={styles.inputTitle}>Banner (Texto)</h2>
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
                const updated = { ...banner, active: e.target.checked };
                setBanner(updated);
                handleSubmit({ banner: updated });
              }}
              color="primary"
            />
          </Box>
          <input
            placeholder="Mensaje del banner"
            type="text"
            value={banner.message}
            onChange={(e) => {
              const updated = { ...banner, message: e.target.value };
              setBanner(updated);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const updated = { ...banner, message: e.target.value };
                setBanner(updated);
                handleSubmit({ banner: updated });
              }
            }}
            className={styles.inputText}
            style={{ backgroundColor: "var(--background)" }}
            disabled={loading}
          />
        </Box>
      )}
      <h2 className={styles.inputTitle}>Banner (Imagen)</h2>
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
              checked={bannerImage.active}
              value={bannerImage.active}
              onChange={(e) => {
                const updated = { ...bannerImage, active: e.target.checked };
                setBannerImage(updated);
                handleSubmit({ bannerImage: updated });
              }}
              color="primary"
            />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {(bannerImage.images.length > 0
              ? bannerImage.images
              : [null]
            ).map((img, index) => (
              <Box key={index} sx={{ position: "relative", width: "8rem" }}>
                {img && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteBannerImage(e, index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      zIndex: 2,
                      bgcolor: "red",
                      "&:hover": { bgcolor: "red" },
                    }}
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                )}
                <Box
                  onClick={() => handleBannerImageClick(img ? index : undefined)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    border: "2px dashed #666",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    overflow: "hidden",
                    bgcolor: "var(--background)",
                    "&:hover": { borderColor: "#aaa" },
                  }}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={`banner-imagen-${index}`}
                      width={128}
                      height={128}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Upload fontSize="large" />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          <button
            onClick={() => handleBannerImageClick(undefined)}
            className={styles.uploadBtn}
            style={{ width: "100%", maxWidth: "unset", marginTop: 0 }}
          >
            + Agregar imagen
          </button>
        </Box>
      )}
      <input
        type="file"
        accept="image/*"
        ref={bannerImageInputRef}
        onChange={handleBannerImageChange}
        style={{ display: "none" }}
      />
      <h2 className={styles.inputTitle}>Zonas de entrega</h2>
      {locationsLoading ? (
        <Skeleton
          variant="rounded"
          sx={{
            width: "20rem",
            height: "3rem",
            borderRadius: "0.5rem",
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            bgcolor: "#303030",
            borderRadius: "0.5rem",
            p: "1rem",
            maxWidth: "30rem",
          }}
        >
          {locations.map((loc) => (
            <Box
              key={loc.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #555",
                borderRadius: "0.5rem",
                p: "0.3rem 0.3rem 0.3rem 1rem",
              }}
            >
              <span style={{ opacity: loc.active ? 1 : 0.5 }}>
                {loc.name}
              </span>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Switch
                  checked={loc.active}
                  onChange={() => handleToggleLocationActive(loc)}
                  color="primary"
                  size="small"
                />
                <Button
                  onClick={() => handleDeleteLocation(loc)}
                  sx={{
                    color: "#ec1000",
                    textTransform: "unset",
                    p: "0rem 0.5rem",
                    "&:hover": { backgroundColor: "#ec3237" },
                  }}
                >
                  Eliminar
                </Button>
              </Box>
            </Box>
          ))}
          <input
            placeholder="Nueva zona (ej. Esquel)"
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLocation();
            }}
            className={styles.inputText}
            style={{ backgroundColor: "var(--background)", marginTop: "0.5rem" }}
          />
          <button
            onClick={handleAddLocation}
            className={styles.uploadBtn}
            style={{ width: "100%", maxWidth: "unset", marginTop: 0 }}
          >
            + Agregar zona
          </button>
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
                  const updated = faqs.map((item, i) =>
                    i === index ? { ...item, question: e.target.value } : item
                  );
                  setFaqs(updated);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const updated = faqs.map((item, i) =>
                      i === index ? { ...item, question: e.target.value } : item
                    );
                    setFaqs(updated);
                    handleSubmit({ faqs: updated });
                  }
                }}
                className={styles.inputText}
                style={{ backgroundColor: "var(--background)" }}
              />
              <textarea
                placeholder="Respuesta"
                value={faq.answer}
                onChange={(e) => {
                  const updated = faqs.map((item, i) =>
                    i === index ? { ...item, answer: e.target.value } : item
                  );
                  setFaqs(updated);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // evita salto de línea
                    const updated = faqs.map((item, i) =>
                      i === index ? { ...item, answer: e.target.value } : item
                    );
                    setFaqs(updated);
                    handleSubmit({ faqs: updated });
                  }
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
