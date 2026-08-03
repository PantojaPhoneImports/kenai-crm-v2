"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { nome: string; children: ReactNode };
type State = { error: Error | null };

export default class DiagnosticErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[diagnostics:error-boundary] erro de renderização", {
      componente: this.props.nome,
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent,
    });
  }

  render() {
    if (this.state.error) {
      return <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-4 text-sm text-red-200">Erro de renderização capturado em: {this.props.nome}.</div>;
    }

    return this.props.children;
  }
}
