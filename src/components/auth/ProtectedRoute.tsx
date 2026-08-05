"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../../contexts/AuthContext";
import { usuarioPodeAcessarRota } from "@/lib/acesso";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, usuario, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    if (!loading && !user) {

      console.warn("[auth:protected-route] redirect para /login", {
        motivo: "contexto finalizou sem usuário Firebase",
        loading,
        uid: null,
      });

      router.replace("/login");

    }

    if (!loading && user && !usuarioPodeAcessarRota(usuario, pathname)) {
      router.replace("/dashboard");
    }

  }, [loading, user, usuario, pathname, router]);

  if (loading) {

    console.info("[auth:protected-route] aguardando AuthContext", { loading, possuiUsuario: Boolean(user) });

    return (

      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">

        Carregando...

      </div>

    );

  }

  if (!user || !usuarioPodeAcessarRota(usuario, pathname)) return null;

  return <>{children}</>;

}
