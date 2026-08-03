"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {

    if (!loading && !user) {

      console.warn("[auth:protected-route] redirect para /login", {
        motivo: "contexto finalizou sem usuário Firebase",
        loading,
        uid: null,
      });

      router.replace("/login");

    }

  }, [loading, user, router]);

  if (loading) {

    console.info("[auth:protected-route] aguardando AuthContext", { loading, possuiUsuario: Boolean(user) });

    return (

      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">

        Carregando...

      </div>

    );

  }

  if (!user) return null;

  return <>{children}</>;

}
