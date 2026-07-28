"use client";

import { migrarSocios } from "@/scripts/migrarSocios";

export default function Page() {

  async function executar() {

    await migrarSocios();

    alert("Migração concluída!");

  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={executar}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Executar Migração
      </button>
    </div>
  );
}