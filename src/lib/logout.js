import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const supabase = createClientComponentClient();

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();

    // Limpiar localStorage y cookies
    localStorage.removeItem("adminSession");
    document.cookie = "adminSession=; Max-Age=0; path=/";

    router.push("/admin");
    router.refresh();
  };

  return logout;
};
