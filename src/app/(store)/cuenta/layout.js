"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CuentaLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          router.replace("/ingresar");
          return;
        }

        let { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error && error.code === "PGRST116") {
          // No existe perfil, creamos uno nuevo
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              role: "client",
            });
          if (insertError) {
            console.log(insertError.message);

            router.replace("/ingresar");
            return;
          }
          // Después de insertar, volvemos a consultar el perfil
          ({ data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single());
        }

        if (error || !profile || profile.role !== "client") {
          router.replace("/ingresar");
          return;
        }

        setLoading(false);
      } catch (err) {
        router.replace("/ingresar");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return <div>Cargando...</div>;

  return <>{children}</>;
}
