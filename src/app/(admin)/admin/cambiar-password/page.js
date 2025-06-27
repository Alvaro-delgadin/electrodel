"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "../page.module.css"; // Reutiliza tu estilo de login
import "@/styles/admin/globals.css";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClientComponentClient();

export default function ResetPassword() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace("#", "?")).get(
      "access_token"
    );
    if (token) {
      setAccessToken(token);
      supabase.auth.setSession({ access_token: token, refresh_token: "" });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 3000);
    }
  };

  return (
    <main className={styles.main}>
      <h1>Cambiar contraseña</h1>

      {success ? (
        <p style={{ color: "lightgreen" }}>
          ✅ Tu contraseña fue actualizada. Serás redirigido al inicio de
          sesión...
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "20rem",
            width: "100%",
          }}
        >
          <label htmlFor="password">Nueva contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Ingresá una nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "1rem 1rem",
              backgroundColor: "transparent",
              color: "white",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
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
            Guardar contraseña
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </main>
  );
}
