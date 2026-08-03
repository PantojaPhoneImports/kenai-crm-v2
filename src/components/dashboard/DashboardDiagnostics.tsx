"use client";

import { useEffect } from "react";

export default function DashboardDiagnostics() {
  useEffect(() => {
    const ambiente = {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      visualViewport: window.visualViewport
        ? `${window.visualViewport.width}x${window.visualViewport.height}`
        : null,
      userAgent: navigator.userAgent,
    };
    console.info("[diagnostics:dashboard] Dashboard montado", ambiente);
    return () => console.info("[diagnostics:dashboard] Dashboard desmontado", ambiente);
  }, []);

  return null;
}
