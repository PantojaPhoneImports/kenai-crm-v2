"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RuntimeDiagnostics({ origem }: { origem: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const registrarAmbiente = (evento: string) => {
      console.info("[diagnostics:runtime] ambiente móvel", {
        evento,
        origem,
        pathname,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        visualViewport: window.visualViewport
          ? `${window.visualViewport.width}x${window.visualViewport.height}`
          : null,
        screen: `${window.screen.width}x${window.screen.height}`,
        userAgent: navigator.userAgent,
      });
    };

    const onError = (event: ErrorEvent) => {
      console.error("[diagnostics:window.onerror] erro JavaScript não tratado", {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        stack: event.error?.stack,
        pathname: window.location.pathname,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: string; stack?: string; code?: string } | undefined;
      console.error("[diagnostics:window.onunhandledrejection] promise rejeitada", {
        reason: event.reason,
        code: reason?.code,
        message: reason?.message,
        stack: reason?.stack,
        pathname: window.location.pathname,
      });
    };

    const onResize = () => registrarAmbiente("resize");
    const onVisualViewportResize = () => registrarAmbiente("visualViewport.resize");

    registrarAmbiente("montagem");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onVisualViewportResize);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onVisualViewportResize);
      console.info("[diagnostics:runtime] componente desmontado", { origem, pathname });
    };
  }, [origem, pathname]);

  return null;
}
