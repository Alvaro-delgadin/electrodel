"use client";
import { useEffect } from "react";
import styles from "./page.module.css";
import "@/styles/admin/globals.css";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const role = session.user.user_metadata?.role;
          if (role === "admin" || role === "dev") {
            router.push("/admin/resumen");
          } else {
            alert(
              "No estás autorizado para ingresar al panel de administración."
            );
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className={styles.main}>
      <h1>Inicio de sesión</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={[]}
        onlyThirdPartyProviders={false}
        view="sign_in"
        showLinks={false}
        localization={{
          variables: {
            sign_in: {
              email_label: "Correo electrónico",
              email_input_placeholder: "Ingresá tu email",
              password_label: "Contraseña",
              password_input_placeholder: "Ingresá tu contraseña",
              button_label: "Iniciar sesión",
              loading_button_label: "Accediendo",
            },
          },
        }}
      />
    </main>
  );
}
