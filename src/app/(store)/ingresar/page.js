"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Ingresar() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithEmail = async () => {
    if (!email) return alert("Ingresá un email válido");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Revisá tu correo para continuar");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Ingresar</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button
        onClick={loginWithEmail}
        disabled={loading}
        style={{ width: "100%", padding: "10px" }}
      >
        {loading ? "Enviando..." : "Enviar enlace de ingreso"}
      </button>
    </div>
  );
}
