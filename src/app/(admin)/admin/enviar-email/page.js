"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "../page.module.css";
import "@/styles/admin/globals.css";

const supabase = createClientComponentClient();

export default function EnviarReset() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("Enviar");
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading("Enviando");
    setError("");
    setMensaje("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://electrodel.com.ar/admin/cambiar-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setLoading("Enviar");
      setMensaje(
        "📬 Si el email existe, se envió un enlace para restablecer la contraseña."
      );
    }
  };

  return (
    <main className={styles.main}>
      <h1>Recuperar contraseña</h1>
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "20rem",
          width: "100%",
        }}
      >
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          placeholder="Ingresá tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "1rem 1rem",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#ec3237",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Enviar
        </button>
        {mensaje && <p style={{ color: "lightgreen" }}>{mensaje}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </main>
  );
}
