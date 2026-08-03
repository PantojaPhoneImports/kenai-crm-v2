"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    console.info("[diagnostics:providers] Providers montado", { pathname });
    return () => console.info("[diagnostics:providers] Providers desmontado", { pathname });
  }, []);

  useEffect(() => {
    console.info("[diagnostics:providers] rota atualizada", { pathname });
  }, [pathname]);

  return <AuthProvider>{children}</AuthProvider>;
}
